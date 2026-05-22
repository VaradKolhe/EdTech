import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: [{ type: String, required: true, trim: true }],
    correctAnswer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
    submodule: { type: mongoose.Schema.Types.ObjectId, ref: "Submodule" },
    title: { type: String, required: true, trim: true },
    questions: [quizQuestionSchema],
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
