import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    thumbnail: { type: String, trim: true, default: "" },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    enrolledStudents: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        progress: { type: Number, default: 0, min: 0, max: 100 },
      },
    ],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    completionRate: { type: Number, default: 0, min: 0, max: 100 },
    category: { type: String, trim: true, default: "General" },
    language: { type: String, trim: true, default: "English" },
    price: { type: Number, default: 0, min: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
