# Recommendation Model Training

This module handles the periodic retraining of the multilingual course recommendation models. It fetches data from MongoDB, trains TF-IDF vectorizers, and calculates cosine similarity matrices for English, Hindi, and Marathi.

## Installation

1.  Navigate to the `ml_backend` directory:
    ```bash
    cd ml_backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Configuration

Create a `.env` file in the `ml_backend` directory with the following variables:
```env
MONGO_URI=your_mongodb_connection_string
DB_NAME=edtech
MODEL_DIR=models
```

## Manual Training

To manually trigger the training pipeline:
```bash
python train_recommendation_model.py
```

## Automation Setup (Cron Job)

### Linux / EC2
1.  Open the crontab editor:
    ```bash
    crontab -e
    ```
2.  Add the following line to run every Sunday at 2 AM (adjust paths as needed):
    ```cron
    0 2 * * 0 cd /path/to/project/ml_backend && /usr/bin/python3 train_recommendation_model.py >> logs/recommendation_cron.log 2>&1
    ```

### Windows
1.  Open **Task Scheduler**.
2.  Click **Create Basic Task...**
3.  Name: `EdTech Recommendation Retraining`
4.  Trigger: **Weekly**, Sundays, 2:00 AM.
5.  Action: **Start a program**.
6.  Program/script: `python.exe` (use full path if necessary).
7.  Add arguments: `train_recommendation_model.py`
8.  Start in: `C:\path\to\project\ml_backend`

## Verification

After successful training:
1.  Check the `ml_backend/models/` directory for updated `.pkl` and `.json` files.
2.  Review the latest metadata in `ml_backend/models/model_metadata.json`.
3.  Check the logs in `ml_backend/logs/recommendation_training.log`.

## Rollback

If training fails, the script is designed to preserve existing model files. If you need to manually rollback:
1.  The script uses a safe-replacement strategy (temp folder).
2.  If you have backups, simply replace the files in `ml_backend/models/` with your previous versions.
