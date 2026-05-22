const mongoose = require("mongoose");

const ContentSchema = new mongoose.Schema({
  type: { type: String, enum: ["text", "video"], required: true },
  value: { type: String, required: true },
});

const QuizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
});

const SubmoduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    contents: [ContentSchema],
    quizzes: [QuizSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submodule", SubmoduleSchema);
