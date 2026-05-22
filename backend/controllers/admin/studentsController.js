import User from "../../models/User.js";

export const getStudents = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const filter = { role: "student", isDeleted: false };
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const students = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch students" });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: "student" },
      { isDeleted: true },
      { new: true }
    ).select("-password");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ message: "Student removed", student });
  } catch (error) {
    res.status(500).json({ message: error.message || "Delete failed" });
  }
};
