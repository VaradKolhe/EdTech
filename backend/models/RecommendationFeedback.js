import mongoose from "mongoose";

const recommendationFeedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    recommendationType: {
      type: String,
      enum: ["DASHBOARD", "SEARCH"],
      required: true,
    },
    feedback: {
      type: String,
      enum: ["RELEVANT", "NOT_RELEVANT"],
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "Too Beginner",
        "Too Advanced",
        "Not My Stream",
        "Already Know This",
        "Too Expensive",
        "Other",
        "",
      ],
      default: "",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

recommendationFeedbackSchema.index({ userId: 1, courseId: 1, createdAt: -1 });

const RecommendationFeedback = mongoose.model(
  "RecommendationFeedback",
  recommendationFeedbackSchema,
  "recommendation_feedback"
);

export default RecommendationFeedback;
