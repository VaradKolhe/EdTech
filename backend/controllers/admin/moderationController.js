import User from "../../models/User.js";
import Course from "../../models/Course.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    let courses = [];
    if (user.role === "instructor") {
      courses = await Course.find({ instructorId: user._id }).select("title status metrics difficulty");
    }

    res.json({ user, courses });
  } catch (error) {
    res.status(500).json({ message: error.message || "Fetch profile failed" });
  }
};

export const removeUser = async (req, res) => {
  try {
    const role = (req.query.role || req.body?.role || "").toLowerCase();
    if (!["student", "instructor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role for moderation" });
    }
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role, isActive: true },
      { isActive: false },
      { returnDocument: "after" }
    ).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (role === "instructor") {
      await Course.updateMany({ instructorId: user._id }, { status: "ARCHIVED" });
    }
    res.json({ message: "User removed via moderation", user });
  } catch (error) {
    res.status(500).json({ message: error.message || "Moderation failed" });
  }
};

export const removeCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: "ARCHIVED" },
      { returnDocument: "after" }
    );
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course removed via moderation", course });
  } catch (error) {
    res.status(500).json({ message: error.message || "Moderation failed" });
  }
};
