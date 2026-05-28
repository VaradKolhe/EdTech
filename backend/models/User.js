import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const USER_ROLES = ["student", "instructor", "admin"];

const localizedTextSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    hi: { type: String, default: "" },
    mr: { type: String, default: "" },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    ageGroup: {
      type: String,
      enum: ["13-17", "18-24", "25-34", "35+", ""],
      default: "",
    },
    educationLevel: {
      type: String,
      enum: [
        "School",
        "Diploma",
        "Undergraduate",
        "Postgraduate",
        "Working Professional",
        "",
      ],
      default: "",
    },
    preferredStreams: [{ type: String, trim: true }],
    skillLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", ""],
      default: "",
    },
    careerGoal: { type: String, trim: true, default: "" },
    budgetPreference: {
      type: String,
      enum: ["Free", "Paid", "Both", ""],
      default: "",
    },
    preferredDifficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", ""],
      default: "",
    },
    preferredLanguage: {
      type: String,
      enum: ["en", "hi", "mr", ""],
      default: "",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, required: true },
    profileImageUrl: { type: String, trim: true, default: "" },
    profile: { type: profileSchema, default: () => ({}) },
    instructorProfile: {
      bio: { type: localizedTextSchema, default: () => ({}) },
      expertise: [{ type: String, trim: true }],
      verification: {
        status: {
          type: String,
          enum: ["NOT_APPLIED", "PENDING", "APPROVED", "REJECTED"],
          default: "NOT_APPLIED",
        },
        workEmail: { type: String, trim: true, lowercase: true },
        links: [{ type: String, trim: true }], // e.g. LinkedIn, Portfolio, GitHub
        documents: [{
          name: { type: String, trim: true },
          url: { type: String, trim: true },
          type: { type: String, enum: ["CERTIFICATE", "DEGREE", "EXPERIENCE_LETTER", "OTHER"] }
        }],
        submittedAt: Date,
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reviewedAt: Date,
        rejectionReason: { type: String, trim: true, default: "" },
      },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      totalCourses: { type: Number, default: 0, min: 0 },
    },
    stats: {
      totalCoursesEnrolled: { type: Number, default: 0, min: 0 },
      totalCoursesCompleted: { type: Number, default: 0, min: 0 },
      averageRatingGiven: { type: Number, default: 0, min: 0, max: 5 },
      totalTimeSpentMinutes: { type: Number, default: 0, min: 0 },
    },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.virtual("password").set(function (password) {
  this._plainPassword = password;
});

userSchema.pre("validate", async function () {
  if (this._plainPassword) {
    if (this._plainPassword.length < 6) {
      this.invalidate("passwordHash", "Password must be at least 6 characters");
      return;
    }
    this.passwordHash = await bcrypt.hash(this._plainPassword, 12);
  }
});

userSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.passwordHash) {
    throw new Error("Password hash not found for user");
  }
  return bcrypt.compareSync(candidatePassword, this.passwordHash);
};

userSchema.methods.toPublicJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

const User = mongoose.model("User", userSchema);
export default User;
