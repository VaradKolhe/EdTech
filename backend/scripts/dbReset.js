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

  await mongoose.connect(process.env.MONGO_URI);
  const dbName = mongoose.connection.name;
  console.warn(`WARNING: deleting final-schema collections from database: ${dbName}`);

  for (const name of FINAL_COLLECTIONS) {
    if ((await mongoose.connection.db.listCollections({ name }).toArray()).length) {
      await mongoose.connection.db.collection(name).deleteMany({});
      console.log(`Cleared ${name}`);
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
