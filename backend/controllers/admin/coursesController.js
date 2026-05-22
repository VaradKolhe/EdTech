import Course from "../../models/Course.js";

export const getCourses = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const filter = { isDeleted: false };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    const courses = await Course.find(filter)
      .populate("teacher", "fullName email")
      .sort({ createdAt: -1 });
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch courses" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    ).populate("teacher", "fullName email");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course removed", course });
  } catch (error) {
    res.status(500).json({ message: error.message || "Delete failed" });
  }
};
