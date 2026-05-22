import Module from "../models/Module.js";
import Course from "../models/Course.js";
import Submodule from "../models/Submodule.js";

const getOwnedCourse = async (courseId, user) => {
  const course = await Course.findOne({
    _id: courseId,
    isDeleted: false,
    ...(user.role === "teacher" ? { teacher: user._id } : {}),
  });
  return course;
};

export const createModule = async (req, res) => {
  try {
    const { courseId, title, moduleNumber } = req.body;
    const course = await getOwnedCourse(courseId, req.user);
    if (!course) return res.status(404).json({ error: "Course not found" });
    const module = await Module.create({ courseId, title, moduleNumber });
    await Course.findByIdAndUpdate(courseId, { $push: { modules: module._id } });
    res.status(201).json(module);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateModule = async (req, res) => {
  try {
    const existing = await Module.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Module not found" });
    const course = await getOwnedCourse(existing.courseId, req.user);
    if (!course) return res.status(403).json({ error: "Not authorized for this module" });

    const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(module);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ error: "Module not found" });
    const course = await getOwnedCourse(module.courseId, req.user);
    if (!course) return res.status(403).json({ error: "Not authorized for this module" });

    await Module.findByIdAndDelete(module._id);
    await Course.findByIdAndUpdate(module.courseId, { $pull: { modules: module._id } });
    await Submodule.deleteMany({ moduleId: module._id });
    res.json({ message: "Module deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
