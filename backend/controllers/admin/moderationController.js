import User from "../../models/User.js";
import Course from "../../models/Course.js";

export const removeUser = async (req, res) => {
  try {
    const role = req.query.role || req.body?.role;
    if (!["student", "teacher"].includes(role)) {
      return res.status(400).json({ message: "Invalid role for moderation" });
    }
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role, isDeleted: false },
      { isDeleted: true },
      { new: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (role === "teacher") {
      await Course.updateMany({ teacher: user._id }, { isDeleted: true });
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
      { isDeleted: true },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course removed via moderation", course });
  } catch (error) {
    res.status(500).json({ message: error.message || "Moderation failed" });
  }
};
