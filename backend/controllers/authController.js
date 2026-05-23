import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImageUrl: user.profileImageUrl,
  profile: user.profile,
  instructorProfile: user.role === "instructor" ? user.instructorProfile : undefined,
  stats: user.stats,
  token: generateToken(user._id, user.role),
});

export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const studentName = name;

    if (!studentName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name: studentName,
      email,
      password,
      role: "student",
    });

    res.status(201).json({
      message: "Student registered successfully",
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

export const registerInstructor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      expertise = [],
      bio = {},
    } = req.body;
    const instructorName = name;

    if (!instructorName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name: instructorName,
      email,
      password,
      role: "instructor",
      instructorProfile: {
        bio,
        expertise: Array.isArray(expertise) ? expertise : [expertise].filter(Boolean),
        verification: { status: "PENDING" },
      },
    });

    res.status(201).json({
      message: "Instructor registered successfully. Awaiting admin approval.",
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordHash"
    );
    if (!user || !user.comparePassword(password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }
    if (
      user.role === "instructor" &&
      user.instructorProfile?.verification?.status === "REJECTED"
    ) {
      return res.status(403).json({
        message: "Your instructor account has been rejected. Contact support.",
      });
    }

    res.json({ message: "Login successful", user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message || "Login failed" });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

    await user.save();

    // In a real app, send email here. 
    // In development, return token in response to facilitate testing without SMTP.
    res.json({
      message: "If an account exists, you will receive a reset link.",
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to process request" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to reset password" });
  }
};
