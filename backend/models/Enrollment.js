import mongoose from "mongoose";

const completedBlockSchema = new mongoose.Schema(
  {
    moduleId: { type: mongoose.Schema.Types.ObjectId, required: true },
    submoduleId: { type: mongoose.Schema.Types.ObjectId, required: true },
    blockId: { type: mongoose.Schema.Types.ObjectId, required: true },
    blockType: {
      type: String,
      enum: ["TEXT", "VIDEO", "QUIZ"],
      required: true,
    },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const enrollmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    accessStatus: {
      type: String,
      enum: ["ACTIVE", "LOCKED", "EXPIRED", "REFUNDED"],
      default: "ACTIVE",
    },
    status: {
      type: String,
      enum: ["ENROLLED", "COMPLETED"],
      default: "ENROLLED",
    },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    completedBlocks: [completedBlockSchema],
    quizResults: [
      {
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        score: Number,
        totalMarks: Number,
        percentage: Number,
        status: { type: String, enum: ["PASSED", "FAILED"] },
        attemptedAt: { type: Date, default: Date.now },
      },
    ],
    completionStatus: {
      allRequiredBlocksCompleted: { type: Boolean, default: false },
      allRequiredQuizzesPassed: { type: Boolean, default: true },
      completedAt: Date,
    },
    certificateId: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate" },
    lastAccessed: {
      moduleId: mongoose.Schema.Types.ObjectId,
      submoduleId: mongoose.Schema.Types.ObjectId,
      blockId: mongoose.Schema.Types.ObjectId,
    },
    totalTimeSpentMinutes: { type: Number, default: 0, min: 0 },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ userId: 1, status: 1 });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;
