const Submodule = require("../models/Submodule");
const Module = require("../models/Module");

exports.createSubmodule = async (req, res) => {
  try {
    const { moduleId, title } = req.body;
    const submodule = await Submodule.create({ moduleId, title });
    await Module.findByIdAndUpdate(moduleId, { $push: { submodules: submodule._id } });
    res.status(201).json(submodule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateSubmodule = async (req, res) => {
  try {
    const submodule = await Submodule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(submodule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSubmodule = async (req, res) => {
  try {
    const submodule = await Submodule.findByIdAndDelete(req.params.id);
    if (!submodule) return res.status(404).json({ error: "Submodule not found" });
    await Module.findByIdAndUpdate(submodule.moduleId, { $pull: { submodules: submodule._id } });
    res.json({ message: "Submodule deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubmoduleContent = async (req, res) => {
  try {
    const submodule = await Submodule.findById(req.params.id);
    if (!submodule) return res.status(404).json({ error: "Submodule not found" });
    res.json({ contents: submodule.contents, quizzes: submodule.quizzes, blocks: submodule.blocks || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addContent = async (req, res) => {
  try {
    const { submoduleId, type, value } = req.body;
    const submodule = await Submodule.findByIdAndUpdate(
      submoduleId,
      { $push: { contents: { type, value } } },
      { new: true }
    );
    res.json(submodule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.saveBlocks = async (req, res) => {
  try {
    const { blocks } = req.body;
    const submodule = await Submodule.findByIdAndUpdate(
      req.params.id,
      { $set: { blocks } },
      { new: true }
    );
    res.json(submodule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.addQuiz = async (req, res) => {
  try {
    const { submoduleId, question, options, correctAnswer } = req.body;
    const submodule = await Submodule.findByIdAndUpdate(
      submoduleId,
      { $push: { quizzes: { question, options, correctAnswer } } },
      { new: true }
    );
    res.json(submodule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
