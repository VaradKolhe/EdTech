import os
import re
import json
import shutil
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import joblib
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import nltk
from nltk.corpus import stopwords


# ============================================================
# 1. BASE PATHS AND ENV CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "edtech")

MODEL_DIR = Path(
    os.getenv("MODEL_DIR", str(BASE_DIR / "models"))
).resolve()

LOG_DIR = BASE_DIR / "logs"
BACKUP_DIR = MODEL_DIR / "backups"

TEMP_MODEL_DIR = MODEL_DIR / "_temp_training"

LANGUAGES = ["en", "hi", "mr"]

REQUIRED_MODEL_FILES = [
    "tfidf_vectorizer_en.pkl",
    "tfidf_vectorizer_hi.pkl",
    "tfidf_vectorizer_mr.pkl",
    "similarity_matrix_en.pkl",
    "similarity_matrix_hi.pkl",
    "similarity_matrix_mr.pkl",
    "course_dataframe.pkl",
    "course_id_mapping.json",
    "model_metadata.json",
]


# ============================================================
# 2. DIRECTORY SETUP
# ============================================================

MODEL_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)
BACKUP_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# 3. LOGGING SETUP
# ============================================================

LOG_FILE = LOG_DIR / "recommendation_training.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(),
    ],
)

logger = logging.getLogger("recommendation_training")


# ============================================================
# 4. NLTK SETUP
# ============================================================

def initialize_nltk() -> set:
    """
    Ensure English stopwords are available.

    For production, it is better to install NLTK data during server setup.
    However, for student/hackathon deployment, this fallback download is acceptable.
    """

    try:
        nltk.data.find("corpora/stopwords")
    except LookupError:
        logger.warning("NLTK stopwords not found. Downloading stopwords...")
        nltk.download("stopwords", quiet=True)

    try:
        return set(stopwords.words("english"))
    except Exception as exc:
        logger.warning(
            "Failed to load NLTK stopwords. Continuing with empty stopword list. Error: %s",
            exc,
        )
        return set()


STOP_WORDS = initialize_nltk()


# ============================================================
# 5. UTILITY FUNCTIONS
# ============================================================

def utc_now_iso() -> str:
    """Return current UTC time as ISO string."""
    return datetime.now(timezone.utc).isoformat()


def clean_text(text: Any) -> str:
    """
    Clean text for TF-IDF training.

    Supports:
    - English
    - Hindi
    - Marathi
    - Numbers

    Removes:
    - URLs
    - Special characters
    - Extra spaces
    - English stopwords
    """

    if text is None:
        return ""

    try:
        if pd.isna(text):
            return ""
    except Exception:
        pass

    text = str(text).lower()

    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"[^a-zA-Z0-9\u0900-\u097F\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    words = [
        word for word in text.split()
        if word not in STOP_WORDS
    ]

    return " ".join(words).strip()


def safe_get(obj: Dict[str, Any], *keys: str, default: Any = "") -> Any:
    """
    Safely get nested dictionary values.

    Example:
    safe_get(course, "title", "en")
    """

    try:
        current = obj
        for key in keys:
            current = current[key]

        if current is None or current == "":
            return default

        return current

    except (KeyError, TypeError, IndexError):
        return default


def safe_join(value: Any) -> str:
    """
    Convert list/string values into a safe text string.

    Handles:
    - list of strings
    - string
    - None
    - unexpected values
    """

    if value is None:
        return ""

    if isinstance(value, list):
        return " ".join(str(item) for item in value if item is not None)

    return str(value)


def mask_mongo_uri(uri: Optional[str]) -> str:
    """
    Return a masked MongoDB URI for logs.
    Never print full credentials.
    """

    if not uri:
        return "MONGO_URI_NOT_SET"

    return re.sub(r"//([^:/@]+):([^@]+)@", r"//****:****@", uri)


def validate_environment() -> bool:
    """
    Validate required environment variables.
    """

    if not MONGO_URI:
        logger.error("MONGO_URI is missing. Add it to ml_backend/.env")
        return False

    if not DB_NAME:
        logger.error("DB_NAME is missing. Add DB_NAME=edtech to ml_backend/.env")
        return False

    logger.info("Environment loaded successfully.")
    logger.info("Database name: %s", DB_NAME)
    logger.info("Mongo URI: %s", mask_mongo_uri(MONGO_URI))
    logger.info("Model directory: %s", MODEL_DIR)
    logger.info("Log file: %s", LOG_FILE)

    return True


# ============================================================
# 6. DATABASE FUNCTIONS
# ============================================================

def get_mongo_client() -> MongoClient:
    """
    Create and verify MongoDB connection.
    """

    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=10000,
        connectTimeoutMS=10000,
        socketTimeoutMS=30000,
    )

    client.admin.command("ping")
    return client


def fetch_published_courses(db) -> List[Dict[str, Any]]:
    """
    Fetch published courses from MongoDB.

    Supports multiple project variants:
    - status: PUBLISHED
    - status: published
    - status: Published
    - isPublished: true
    """

    published_filter = {
        "$or": [
            {"status": "PUBLISHED"},
            {"status": "published"},
            {"status": "Published"},
            {"isPublished": True},
        ]
    }

    courses = list(db.courses.find(published_filter))
    return courses


# ============================================================
# 7. DATA PREPARATION
# ============================================================

def flatten_courses(courses: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Convert MongoDB course documents into a clean DataFrame
    suitable for TF-IDF training.
    """

    flattened_courses: List[Dict[str, Any]] = []

    for course in courses:
        try:
            recommendation_features = course.get("recommendationFeatures", {}) or {}
            metrics = course.get("metrics", {}) or {}

            course_id = str(course.get("_id", "")).strip()

            if not course_id:
                logger.warning("Skipping course because _id is missing.")
                continue

            stream = str(
                recommendation_features.get("stream", "")
                or course.get("stream", "")
                or "General"
            )

            keywords = safe_join(
                recommendation_features.get("keywords", [])
            )

            row: Dict[str, Any] = {
                "course_id": course_id,
                "difficulty": course.get("difficulty", "Beginner"),
                "stream": stream,
                "keywords": keywords,
                "averageRating": metrics.get("averageRating", 0),
                "popularityScore": metrics.get("popularityScore", 0),
                "languageAvailable": course.get("languageAvailable", []),
            }

            for language in LANGUAGES:
                title = safe_get(course, "title", language, default="")
                description = safe_get(course, "description", language, default="")
                tags = safe_join(
                    safe_get(course, "tags", language, default=[])
                )

                combined_text = clean_text(
                    f"""
                    {title}
                    {description}
                    {tags}
                    {stream}
                    {keywords}
                    """
                )

                row[f"title_{language}"] = title
                row[f"combined_{language}"] = combined_text

            flattened_courses.append(row)

        except Exception as exc:
            logger.exception(
                "Failed to process course with ID %s. Error: %s",
                course.get("_id"),
                exc,
            )

    df = pd.DataFrame(flattened_courses)

    if df.empty:
        return df

    for language in LANGUAGES:
        combined_col = f"combined_{language}"

        if combined_col not in df.columns:
            df[combined_col] = ""

        df[combined_col] = df[combined_col].fillna("").astype(str)

    return df


def validate_training_dataframe(df: pd.DataFrame) -> bool:
    """
    Validate that DataFrame has enough usable course data.
    """

    if df.empty:
        logger.error("Training DataFrame is empty.")
        return False

    if "course_id" not in df.columns:
        logger.error("course_id column is missing from DataFrame.")
        return False

    if df["course_id"].duplicated().any():
        duplicate_count = int(df["course_id"].duplicated().sum())
        logger.warning("Found %s duplicate course IDs. Keeping first occurrence.", duplicate_count)
        df.drop_duplicates(subset=["course_id"], keep="first", inplace=True)

    for language in LANGUAGES:
        combined_col = f"combined_{language}"

        if combined_col not in df.columns:
            logger.error("Missing column: %s", combined_col)
            return False

    non_empty_any_language = df[
        [f"combined_{language}" for language in LANGUAGES]
    ].apply(lambda row: any(str(value).strip() for value in row), axis=1)

    usable_courses = int(non_empty_any_language.sum())

    if usable_courses == 0:
        logger.error("No usable course text found for training.")
        return False

    logger.info("Usable courses for training: %s", usable_courses)
    return True


# ============================================================
# 8. MODEL TRAINING
# ============================================================

def get_vectorizer(language: str) -> TfidfVectorizer:
    """
    Return language-specific TF-IDF vectorizer.

    English:
    - Word-based unigrams and bigrams.

    Hindi/Marathi:
    - Character n-grams because tokenization is harder and char-level
      matching works better for Devanagari scripts in lightweight systems.
    """

    if language == "en":
        return TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            min_df=1,
        )

    return TfidfVectorizer(
        max_features=5000,
        analyzer="char_wb",
        ngram_range=(2, 4),
        min_df=1,
    )


def train_language_model(
    df: pd.DataFrame,
    language: str,
    output_dir: Path,
) -> None:
    """
    Train and save TF-IDF vectorizer and cosine similarity matrix
    for a single language.
    """

    combined_col = f"combined_{language}"

    texts = df[combined_col].fillna("").astype(str).tolist()

    # TfidfVectorizer fails if every document is empty.
    # This fallback prevents full training failure for one language.
    if not any(text.strip() for text in texts):
        logger.warning(
            "All text values are empty for language '%s'. Using fallback placeholder text.",
            language,
        )
        texts = ["placeholder"] * len(df)

    vectorizer = get_vectorizer(language)

    logger.info("Fitting TF-IDF vectorizer for language: %s", language)
    tfidf_matrix = vectorizer.fit_transform(texts)

    logger.info("Creating cosine similarity matrix for language: %s", language)
    similarity_matrix = cosine_similarity(tfidf_matrix)

    vectorizer_path = output_dir / f"tfidf_vectorizer_{language}.pkl"
    similarity_path = output_dir / f"similarity_matrix_{language}.pkl"

    joblib.dump(vectorizer, vectorizer_path)
    joblib.dump(similarity_matrix, similarity_path)

    logger.info(
        "Saved language model files for '%s': %s, %s",
        language,
        vectorizer_path.name,
        similarity_path.name,
    )


# ============================================================
# 9. FILE SAFETY, BACKUP, AND EXPORT
# ============================================================

def reset_temp_dir() -> None:
    """
    Remove old temp training directory and create a fresh one.
    """

    if TEMP_MODEL_DIR.exists():
        shutil.rmtree(TEMP_MODEL_DIR)

    TEMP_MODEL_DIR.mkdir(parents=True, exist_ok=True)


def create_backup_if_models_exist() -> Optional[Path]:
    """
    Create timestamped backup of current model files.

    Returns:
    - Backup path if backup created.
    - None if no existing models were found.
    """

    existing_files = [
        MODEL_DIR / filename
        for filename in REQUIRED_MODEL_FILES
        if (MODEL_DIR / filename).exists()
    ]

    if not existing_files:
        logger.info("No existing model files found. Backup skipped.")
        return None

    backup_name = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = BACKUP_DIR / backup_name
    backup_path.mkdir(parents=True, exist_ok=True)

    for file_path in existing_files:
        shutil.copy2(file_path, backup_path / file_path.name)

    logger.info("Existing model files backed up to: %s", backup_path)
    return backup_path


def validate_generated_files(output_dir: Path) -> bool:
    """
    Validate that all required model files exist in temp output directory.
    """

    missing_files = [
        filename
        for filename in REQUIRED_MODEL_FILES
        if not (output_dir / filename).exists()
    ]

    if missing_files:
        logger.error("Generated model files are missing: %s", missing_files)
        return False

    return True


def atomic_replace_models() -> None:
    """
    Replace final model files only after all temp files are generated.

    This preserves old model files if training fails midway.
    """

    if not validate_generated_files(TEMP_MODEL_DIR):
        raise RuntimeError("Model file validation failed. Aborting replacement.")

    create_backup_if_models_exist()

    for filename in REQUIRED_MODEL_FILES:
        source = TEMP_MODEL_DIR / filename
        destination = MODEL_DIR / filename

        os.replace(source, destination)

    logger.info("Model files replaced successfully.")


def write_json_utf8(path: Path, data: Any) -> None:
    """
    Write JSON safely with UTF-8 encoding.
    """

    with open(path, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)


# ============================================================
# 10. MAIN TRAINING PIPELINE
# ============================================================

def train_models() -> bool:
    """
    Main training pipeline.

    Returns:
    - True if training completed successfully.
    - False if training failed or was safely aborted.
    """

    logger.info("=" * 70)
    logger.info("Starting recommendation model training pipeline")
    logger.info("=" * 70)

    if not validate_environment():
        return False

    client: Optional[MongoClient] = None

    try:
        logger.info("Connecting to MongoDB...")
        client = get_mongo_client()
        db = client[DB_NAME]
        logger.info("MongoDB connected successfully.")

        logger.info("Fetching published courses...")
        courses = fetch_published_courses(db)

        if not courses:
            logger.warning(
                "No published courses found. Training aborted. Existing models are preserved."
            )
            return False

        logger.info("Published courses fetched: %s", len(courses))

        logger.info("Flattening and cleaning course data...")
        df = flatten_courses(courses)

        logger.info("DataFrame shape: %s", df.shape)

        if not validate_training_dataframe(df):
            logger.error("DataFrame validation failed. Existing models are preserved.")
            return False

        reset_temp_dir()

        logger.info("Training multilingual TF-IDF models...")

        for language in LANGUAGES:
            train_language_model(
                df=df,
                language=language,
                output_dir=TEMP_MODEL_DIR,
            )

        logger.info("Saving shared model files...")

        dataframe_path = TEMP_MODEL_DIR / "course_dataframe.pkl"
        joblib.dump(df, dataframe_path)

        course_id_to_index = {
            str(course_id): int(index)
            for index, course_id in enumerate(df["course_id"])
        }

        write_json_utf8(
            TEMP_MODEL_DIR / "course_id_mapping.json",
            course_id_to_index,
        )

        metadata = {
            "trainedAt": utc_now_iso(),
            "totalCourses": int(len(df)),
            "languages": LANGUAGES,
            "modelType": "TF-IDF + Cosine Similarity",
            "status": "success",
            "database": DB_NAME,
            "files": REQUIRED_MODEL_FILES,
            "notes": [
                "Generated by train_recommendation_model.py",
                "Existing model files are backed up before replacement",
                "Training uses only published courses",
            ],
        }

        write_json_utf8(
            TEMP_MODEL_DIR / "model_metadata.json",
            metadata,
        )

        logger.info("All model files generated in temporary directory.")
        logger.info("Replacing final model files safely...")

        atomic_replace_models()

        if TEMP_MODEL_DIR.exists():
            shutil.rmtree(TEMP_MODEL_DIR)

        logger.info("Training completed successfully.")
        logger.info("Models updated at: %s", MODEL_DIR)
        logger.info("=" * 70)

        return True

    except PyMongoError as exc:
        logger.exception("MongoDB error occurred. Existing models are preserved. Error: %s", exc)
        return False

    except Exception as exc:
        logger.exception("Training failed. Existing models are preserved. Error: %s", exc)
        return False

    finally:
        if client is not None:
            client.close()
            logger.info("MongoDB connection closed.")

        if TEMP_MODEL_DIR.exists():
            try:
                shutil.rmtree(TEMP_MODEL_DIR)
                logger.info("Temporary training directory cleaned.")
            except Exception as cleanup_error:
                logger.warning(
                    "Failed to clean temporary training directory: %s",
                    cleanup_error,
                )


# ============================================================
# 11. SCRIPT ENTRY POINT
# ============================================================

if __name__ == "__main__":
    success = train_models()

    if success:
        logger.info("SYSTEM EXECUTED SUCCESSFULLY")
        raise SystemExit(0)

    logger.error("SYSTEM EXECUTION FAILED OR ABORTED SAFELY")
    raise SystemExit(1)