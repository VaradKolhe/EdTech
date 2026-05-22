import Course from "../models/Course.js";

const isTeacherOwner = (course, user) =>
  user.role === "admin" || String(course.teacher) === String(user._id);

export const createCourse = async (req, res) => {
  try {
    const course = await Course.create({
      title: req.body.title,
      description: req.body.description || "",
      thumbnail: req.body.thumbnail || "",
      category: req.body.category || "General",
      language: req.body.language || "English",
      price: req.body.price ?? 0,
      teacher: req.user._id,
      status: req.body.status || "draft",
    });
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const filter = { isDeleted: false };
    if (req.user.role === "teacher") filter.teacher = req.user._id;

    const courses = await Course.find(filter)
      .populate("teacher", "fullName email verificationStatus")
      .populate({
        path: "modules",
        select: "moduleNumber title submodules",
        populate: {
          path: "submodules",
          select: "title blocks contents quizzes updatedAt",
        },
      })
      .sort({ updatedAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: "modules",
      populate: { path: "submodules", select: "title blocks contents quizzes updatedAt" },
    });
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!isTeacherOwner(course, req.user)) {
      return res.status(403).json({ error: "Not authorized for this course" });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
