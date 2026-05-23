import mongoose from "mongoose";

const localizedTextSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    hi: { type: String, default: "" },
    mr: { type: String, default: "" },
  },
  { _id: false }
);

const ratingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: localizedTextSchema, default: () => ({}) },
  },
  { timestamps: true }
);

ratingSchema.index({ userId: 1, courseId: 1 }, { unique: true });
ratingSchema.index({ courseId: 1, createdAt: -1 });

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
