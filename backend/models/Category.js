import mongoose from "mongoose";

const localizedTextSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    hi: { type: String, default: "" },
    mr: { type: String, default: "" },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: localizedTextSchema, default: () => ({}) },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: localizedTextSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
