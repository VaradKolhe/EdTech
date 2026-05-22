const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema(
  {
    moduleNumber: { type: Number, required: true },
    title: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    submodules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Submodule" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Module", ModuleSchema);
