import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CertificateTemplate",
      required: true,
    },
    certificateId: { type: String, required: true, unique: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    courseTitle: { type: String, required: true, trim: true },
    instructorName: { type: String, required: true, trim: true },
    certificateUrl: { type: String, required: true, trim: true },
    issuedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["GENERATED", "REVOKED"], default: "GENERATED" },
  },
  { versionKey: false }
);

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
