import mongoose from "mongoose";
import { resetDatabase } from "./dbReset.js";
import { seedDatabase } from "./dbSeed.js";

const run = async () => {
  await resetDatabase({ force: process.argv.includes("--force") });
  await mongoose.disconnect();
  await seedDatabase();
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error.message || error);
  await mongoose.disconnect().catch(() => null);
  process.exit(1);
});
