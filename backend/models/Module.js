import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    moduleNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    submodules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Submodule" }],
  },
  { timestamps: true }
);

const Module = mongoose.model("Module", moduleSchema);
export default Module;
