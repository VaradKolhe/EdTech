import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    preferredLanguage: { type: String, trim: true, default: "en" },
    enrolledCourses: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        progress: { type: Number, min: 0, max: 100, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
