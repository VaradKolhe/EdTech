import mongoose from "mongoose";

const localizedTextSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    hi: { type: String, default: "" },
    mr: { type: String, default: "" },
  },
  { _id: false }
);

const contentBlockSchema = new mongoose.Schema(
  {
    blockId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    order: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["TEXT", "VIDEO", "QUIZ"], required: true },
    title: { type: localizedTextSchema, default: () => ({}) },
    textContent: { type: localizedTextSchema, default: () => ({}) },
    video: {
      type: { type: String, enum: ["upload", "external", null], default: null },
      url: { type: String, trim: true, default: "" },
      provider: { type: String, enum: ["local", "youtube", "vimeo", "direct", "other", null], default: null },
      originalName: { type: String, trim: true, default: "" },
      storedName: { type: String, trim: true, default: "" },
      mimeType: { type: String, trim: true, default: "" },
      size: { type: Number, default: 0 },
      uploadedAt: { type: Date }
    },
    durationMinutes: { type: Number, default: 0, min: 0 },
    isPreview: { type: Boolean, default: false },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    isRequiredForCompletion: { type: Boolean, default: true },
  },
  { _id: false }
);

const submoduleSchema = new mongoose.Schema(
  {
    submoduleId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    order: { type: Number, required: true, min: 0 },
    submoduleTitle: { type: localizedTextSchema, default: () => ({}) },
    submoduleDescription: { type: localizedTextSchema, default: () => ({}) },
    contentBlocks: [contentBlockSchema],
  }
);

const moduleSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    order: { type: Number, required: true, min: 0 },
    moduleTitle: { type: localizedTextSchema, default: () => ({}) },
    moduleDescription: { type: localizedTextSchema, default: () => ({}) },
    submodules: [submoduleSchema],
  }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: localizedTextSchema, required: true },
    description: { type: localizedTextSchema, default: () => ({}) },
    shortDescription: { type: localizedTextSchema, default: () => ({}) },
    languageAvailable: {
      type: [String],
      enum: ["en", "hi", "mr"],
      default: ["en"],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: {
      en: [{ type: String, trim: true }],
      hi: [{ type: String, trim: true }],
      mr: [{ type: String, trim: true }],
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, enum: ["INR"], default: "INR" },
    isPaid: { type: Boolean, default: false },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    thumbnailUrl: { type: String, trim: true, default: "" },
    certificateTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CertificateTemplate",
    },
    completionRules: {
      requireAllContentBlocksCompleted: { type: Boolean, default: true },
      requireAllQuizzesPassed: { type: Boolean, default: false },
      minimumQuizPassingPercentage: { type: Number, default: 50, min: 0, max: 100 },
    },
    modules: [moduleSchema],
    recommendationFeatures: {
      stream: { type: String, trim: true, default: "" },
      skillLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner",
      },
      targetAgeGroups: [{ type: String, trim: true }],
      targetEducationLevels: [{ type: String, trim: true }],
      careerGoals: [{ type: String, trim: true }],
      keywords: [{ type: String, trim: true }],
    },
    translationStatus: {
      hi: {
        type: String,
        enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
        default: "PENDING",
      },
      mr: {
        type: String,
        enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
        default: "PENDING",
      },
    },
    metrics: {
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      totalRatings: { type: Number, default: 0, min: 0 },
      totalEnrollments: { type: Number, default: 0, min: 0 },
      completionRate: { type: Number, default: 0, min: 0, max: 100 },
      popularityScore: { type: Number, default: 0, min: 0 },
      feedbackScore: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING_REVIEW", "PAYMENT_PENDING", "PUBLISHED", "REJECTED", "ARCHIVED"],
      default: "DRAFT",
    },
    submittedAt: Date,
    reviewedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String, trim: true, default: "" },
    platformFeePaid: { type: Boolean, default: false },
    platformFeePaymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    publishedAt: Date,
    archivedAt: Date,
    archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    archiveReason: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

courseSchema.pre("validate", function () {
  this.isPaid = Number(this.price || 0) > 0;
});

courseSchema.index({ status: 1, categoryId: 1, difficulty: 1 });
courseSchema.index({
  "title.en": "text",
  "description.en": "text",
  "shortDescription.en": "text",
  "recommendationFeatures.keywords": "text",
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
