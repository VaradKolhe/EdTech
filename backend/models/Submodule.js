import mongoose from "mongoose";

const localizedTextSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    hi: { type: String, default: "" },
    mr: { type: String, default: "" },
  },
  { _id: false }
);

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: localizedTextSchema, default: () => ({}) },
    options: [{ type: String, default: "" }],
    correctAnswer: { type: String, default: "" },
  },
  { _id: false }
);

const blockSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["TEXT", "VIDEO", "QUIZ"], required: true },
    order: { type: Number, default: 0 },
    content: { type: localizedTextSchema, default: () => ({}) },
    videoUrl: { type: String, default: "" },
    videoTitle: { type: localizedTextSchema, default: () => ({}) },
    videoDuration: { type: String, default: "" },
    quizQuestions: [quizQuestionSchema],
  },
  { timestamps: true }
);

const submoduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    blocks: [blockSchema],
    contents: [{ type: { type: String }, value: String }],
    quizzes: [{ question: String, options: [String], correctAnswer: String }],
  },
  { timestamps: true }
);

const Submodule = mongoose.model("Submodule", submoduleSchema);
export default Submodule;
