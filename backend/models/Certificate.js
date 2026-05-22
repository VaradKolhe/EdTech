import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: "CertificateTemplate" },
    certificateUrl: { type: String, trim: true, default: "" },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
