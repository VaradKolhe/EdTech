const mongoose = require("mongoose");

const BlockSchema = new mongoose.Schema({
  type: { type: String, enum: ["TEXT", "VIDEO", "QUIZ"], required: true },
  order: { type: Number, default: 0 },
  // TEXT
  content: {
    en: { type: String, default: "" },
    hi: { type: String, default: "" },
    mr: { type: String, default: "" },
  },
  // VIDEO
  videoUrl: { type: String, default: "" },
  videoTitle: {
    en: { type: String, default: "" },
    hi: { type: String, default: "" },
    mr: { type: String, default: "" },
  },
  videoDuration: { type: String, default: "" },
  // QUIZ
  quizQuestions: [
    {
      question: {
        en: { type: String, default: "" },
        hi: { type: String, default: "" },
        mr: { type: String, default: "" },
      },
      options: [{ type: String }],
      correctAnswer: { type: String, default: "" },
    },
  ],
});

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
