const Module = require("../models/Module");
const Course = require("../models/Course");
const Submodule = require("../models/Submodule");

exports.createModule = async (req, res) => {
  try {
    const { courseId, title, moduleNumber } = req.body;
    const module = await Module.create({ courseId, title, moduleNumber });
    await Course.findByIdAndUpdate(courseId, { $push: { modules: module._id } });
    res.status(201).json(module);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(module);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndDelete(req.params.id);
    if (!module) return res.status(404).json({ error: "Module not found" });
    await Course.findByIdAndUpdate(module.courseId, { $pull: { modules: module._id } });
    await Submodule.deleteMany({ moduleId: module._id });
    res.json({ message: "Module deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
