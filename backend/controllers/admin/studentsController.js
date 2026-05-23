import User from "../../models/User.js";

export const getStudents = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const filter = { role: "student", isActive: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const students = await User.find(filter)
      .select("-passwordHash")
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
      { isActive: false },
      { returnDocument: "after" }
    ).select("-passwordHash");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ message: "Student removed", student });
  } catch (error) {
    res.status(500).json({ message: error.message || "Delete failed" });
  }
};
