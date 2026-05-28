import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const FINAL_COLLECTIONS = [
  "users",
  "courses",
  "categories",
  "quizzes",
  "enrollments",
  "payments",
  "ratings",
  "user_activity",
  "recommendation_feedback",
  "certificate_templates",
  "certificates",
  "notifications",
];

export const resetDatabase = async ({ force = false } = {}) => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to reset database in production");
  }
  if (!force) {
    throw new Error("Reset requires --force");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI");
  }

  const mongoUri = process.env.MONGO_URI;
  const options = {};
  // If URI doesn't explicitly contain a database name before the query params, 
  // or if we want to ensure it uses 'edtech'
  if (!mongoUri.includes("/edtech")) {
     options.dbName = "edtech";
  }

  await mongoose.connect(mongoUri, options);
  const db = mongoose.connection.db;
  const dbName = mongoose.connection.name;
  console.warn(`WARNING: deleting final-schema collections from database: ${dbName}`);

  for (const name of FINAL_COLLECTIONS) {
    try {
      await db.collection(name).deleteMany({});
      console.log(`Cleared ${name}`);
    } catch (err) {
      // Collection might not exist, skip
    }
  }
};

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  resetDatabase({ force: process.argv.includes("--force") })
    .then(async () => {
      await mongoose.disconnect();
      console.log("Database reset complete.");
    })
    .catch(async (error) => {
      console.error(error.message);
      await mongoose.disconnect().catch(() => null);
      process.exit(1);
    });
}
