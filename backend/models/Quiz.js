import mongoose from "mongoose";

const localizedTextSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    hi: { type: String, default: "" },
    mr: { type: String, default: "" },
  },
  { _id: false }
);

const optionSchema = new mongoose.Schema(
  {
    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    text: { type: localizedTextSchema, default: () => ({}) },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    questionText: { type: localizedTextSchema, default: () => ({}) },
    options: [optionSchema],
    correctAnswerIndex: { type: Number, min: 0 },
    correctOptionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    marks: { type: Number, default: 1, min: 0 },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, required: true },
    submoduleId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: localizedTextSchema, default: () => ({}) },
    questions: [questionSchema],
    totalMarks: { type: Number, default: 0, min: 0 },
    passingMarks: { type: Number, default: 0, min: 0 },
    timeLimitMinutes: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
