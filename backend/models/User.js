import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ROLES = ["student", "teacher", "admin"];
const VERIFICATION_STATUSES = ["pending", "approved", "rejected"];

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      required: true,
    },
    qualification: {
      type: String,
      trim: true,
    },
    experience: {
      type: Number,
      min: 0,
    },
    specialization: {
      type: String,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
    },
    degreeSpecialization: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: "pending",
    },
    enrolledCourseCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("validate", function () {
  if (this.role !== "teacher") return;

  if (this.yearsOfExperience == null && this.experience != null) {
    this.yearsOfExperience = this.experience;
  }
  if (this.experience == null && this.yearsOfExperience != null) {
    this.experience = this.yearsOfExperience;
  }
  if (!this.degreeSpecialization && this.specialization) {
    this.degreeSpecialization = this.specialization;
  }
  if (!this.specialization && this.degreeSpecialization) {
    this.specialization = this.degreeSpecialization;
  }
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model("User", userSchema);

export { ROLES, VERIFICATION_STATUSES };
export default User;
