import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    activityType: {
      type: String,
      enum: [
        "SEARCH",
        "COURSE_CLICK",
        "VIDEO_WATCH",
        "TEXT_READ",
        "QUIZ_ATTEMPT",
        "ENROLL",
        "COMPLETE",
        "RATING",
      ],
      required: true,
    },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    moduleId: mongoose.Schema.Types.ObjectId,
    submoduleId: mongoose.Schema.Types.ObjectId,
    blockId: mongoose.Schema.Types.ObjectId,
    searchQuery: { type: String, trim: true, default: "" },
    metadata: {
      language: { type: String, enum: ["en", "hi", "mr"], default: "en" },
      timeSpentSeconds: { type: Number, min: 0, default: 0 },
      watchedPercentage: { type: Number, min: 0, max: 100, default: 0 },
      page: {
        type: String,
        enum: ["dashboard", "search", "course_detail", "course_player"],
        default: "dashboard",
      },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

userActivitySchema.index({ userId: 1, createdAt: -1 });
userActivitySchema.index({ activityType: 1, createdAt: -1 });

const UserActivity = mongoose.model(
  "UserActivity",
  userActivitySchema,
  "user_activity"
);

export default UserActivity;
