import User from "../../models/User.js";
import Course from "../../models/Course.js";

const teacherFilter = (search, status) => {
  const filter = { role: "teacher", isDeleted: false };
  if (status) filter.verificationStatus = status;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { qualification: { $regex: search, $options: "i" } },
    ];
  }
  return filter;
};

export const getTeachers = async (req, res) => {
  try {
    const { search = "", status = "" } = req.query;
    const teachers = await User.find(teacherFilter(search, status))
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ teachers });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch teachers" });
  }
};

export const updateTeacherVerification = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid verification status" });
    }
    const teacher = await User.findOneAndUpdate(
      { _id: req.params.id, role: "teacher", isDeleted: false },
      { verificationStatus: status },
      { new: true }
    ).select("-password");
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.json({ message: `Teacher ${status}`, teacher });
  } catch (error) {
    res.status(500).json({ message: error.message || "Update failed" });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await User.findOneAndUpdate(
      { _id: req.params.id, role: "teacher" },
      { isDeleted: true },
      { new: true }
    ).select("-password");
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    await Course.updateMany({ teacher: teacher._id }, { isDeleted: true });
    res.json({ message: "Teacher removed", teacher });
  } catch (error) {
    res.status(500).json({ message: error.message || "Delete failed" });
  }
};
