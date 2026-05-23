import mongoose from "mongoose";

export const CERTIFICATE_PLACEHOLDERS = [
  "studentName",
  "courseTitle",
  "completionDate",
  "certificateId",
  "instructorName",
];

const certificateTemplateSchema = new mongoose.Schema(
  {
    uploadedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    templateName: { type: String, required: true, trim: true },
    templateUrl: { type: String, required: true, trim: true },
    templateType: { type: String, enum: ["IMAGE", "PDF"], required: true },
    placeholders: {
      type: [String],
      enum: CERTIFICATE_PLACEHOLDERS,
      default: CERTIFICATE_PLACEHOLDERS,
    },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CertificateTemplate = mongoose.model(
  "CertificateTemplate",
  certificateTemplateSchema
);

export default CertificateTemplate;
