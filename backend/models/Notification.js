import mongoose from "mongoose";

const localizedTextSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    hi: { type: String, default: "" },
    mr: { type: String, default: "" },
  },
  { _id: false }
);

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: localizedTextSchema, default: () => ({}) },
    message: { type: localizedTextSchema, default: () => ({}) },
    type: {
      type: String,
      enum: ["COURSE", "QUIZ", "CERTIFICATE", "PAYMENT", "RECOMMENDATION", "ADMIN"],
      required: true,
    },
    relatedCourseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    relatedEnrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" },
    relatedCertificateId: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate" },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
