const mongoose = require("mongoose");

const LocalizedTextSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    hi: { type: String, default: "" },
    mr: { type: String, default: "" },
  },
  { _id: false }
);

const QuizQuestionSchema = new mongoose.Schema(
  {
    question: { type: LocalizedTextSchema, default: () => ({}) },
    options: [{ type: String, default: "" }],
    correctAnswer: { type: String, default: "" },
  },
  { _id: false }
);

const BlockSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["TEXT", "VIDEO", "QUIZ"], required: true },
    order: { type: Number, default: 0 },
    content: { type: LocalizedTextSchema, default: () => ({}) },
    videoUrl: { type: String, default: "" },
    videoTitle: { type: LocalizedTextSchema, default: () => ({}) },
    videoDuration: { type: String, default: "" },
    quizQuestions: [QuizQuestionSchema],
  },
  { timestamps: true }
);

const SubmoduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    blocks: [BlockSchema],
    // keep legacy fields so old data still works
    contents: [{ type: { type: String }, value: String }],
    quizzes: [{ question: String, options: [String], correctAnswer: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submodule", SubmoduleSchema);
