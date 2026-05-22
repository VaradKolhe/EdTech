import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const buildAuthResponse = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  verificationStatus: user.verificationStatus,
  token: generateToken(user._id, user.role),
});

export const registerStudent = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role: "student",
    });

    res.status(201).json({
      message: "Student registered successfully",
      user: buildAuthResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

export const registerTeacher = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      qualification,
      yearsOfExperience,
      degreeSpecialization,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword ||
      !qualification ||
      yearsOfExperience === undefined ||
      yearsOfExperience === "" ||
      !degreeSpecialization
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const years = Number(yearsOfExperience);
    if (Number.isNaN(years) || years < 0) {
      return res
        .status(400)
        .json({ message: "Years of experience must be a valid number" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role: "teacher",
      qualification,
      yearsOfExperience: years,
      degreeSpecialization,
      verificationStatus: "pending",
    });

    res.status(201).json({
      message: "Teacher registered successfully. Awaiting admin approval.",
      user: buildAuthResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password, and role are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role !== role) {
      return res.status(401).json({
        message: "Invalid credentials for selected role",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role === "teacher" && user.verificationStatus === "rejected") {
      return res.status(403).json({
        message: "Your teacher account has been rejected. Contact support.",
      });
    }

    res.json({
      message: "Login successful",
      user: buildAuthResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Login failed" });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};
