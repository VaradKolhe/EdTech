import User from "../../models/User.js";
import Enrollment from "../../models/Enrollment.js";
import Course from "../../models/Course.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let courses = [];
    if (user.role === "student") {
      const enrollments = await Enrollment.find({ userId: user._id }).populate("courseId");
      courses = enrollments.map((e) => e.courseId).filter(Boolean);
    } else if (user.role === "instructor") {
      courses = await Course.find({ instructorId: user._id });
    }

    res.json({ user, courses });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch user profile" });
  }
};
