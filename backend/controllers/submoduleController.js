import Submodule from "../models/Submodule.js";
import Module from "../models/Module.js";
import Course from "../models/Course.js";

const getOwnedModule = async (moduleId, user) => {
  const module = await Module.findById(moduleId);
  if (!module) return null;

  const course = await Course.findOne({
    _id: module.courseId,
    isDeleted: false,
    ...(user.role === "teacher" ? { teacher: user._id } : {}),
  });

  return course ? module : null;
};

const getOwnedSubmodule = async (submoduleId, user) => {
  const submodule = await Submodule.findById(submoduleId);
  if (!submodule) return null;

  const module = await getOwnedModule(submodule.moduleId, user);
  return module ? submodule : null;
};

const normalizeLocalized = (value = {}) => ({
  en: String(value.en || ""),
  hi: String(value.hi || ""),
  mr: String(value.mr || ""),
});

const normalizeQuizQuestion = (question = {}) => ({
  question: normalizeLocalized(question.question),
  options: Array.isArray(question.options)
    ? question.options.slice(0, 8).map((option) => String(option || ""))
    : ["", "", "", ""],
  correctAnswer: String(question.correctAnswer || ""),
});

const normalizeBlock = (block = {}, index) => {
  const type = String(block.type || "").toUpperCase();
  if (!["TEXT", "VIDEO", "QUIZ"].includes(type)) {
    throw new Error(`Invalid lesson block type at position ${index + 1}`);
  }

  return {
    type,
    order: Number.isFinite(Number(block.order)) ? Number(block.order) : index,
    content: normalizeLocalized(block.content),
    videoUrl: String(block.videoUrl || ""),
    videoTitle: normalizeLocalized(block.videoTitle),
    videoDuration: String(block.videoDuration || ""),
    quizQuestions: Array.isArray(block.quizQuestions)
      ? block.quizQuestions.map(normalizeQuizQuestion)
      : [],
  };
};

const sortBlocks = (blocks = []) =>
  [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const buildLegacyContent = (blocks = []) =>
  sortBlocks(blocks)
    .filter((block) => block.type === "TEXT" || block.type === "VIDEO")
    .map((block) => ({
      type: block.type === "TEXT" ? "text" : "video",
      value: block.type === "TEXT" ? block.content?.en || "" : block.videoUrl || "",
    }));

const buildLegacyQuizzes = (blocks = []) =>
  sortBlocks(blocks).flatMap((block) =>
    block.type === "QUIZ"
      ? (block.quizQuestions || []).map((quiz) => ({
          question: quiz.question?.en || "",
          options: quiz.options || [],
          correctAnswer: quiz.correctAnswer || "",
        }))
      : []
  );

const buildBlocksFromLegacy = (submodule) => {
  const blocks = [];

  (submodule.contents || []).forEach((content) => {
    const type = content.type === "video" ? "VIDEO" : "TEXT";
    blocks.push({
      type,
      order: blocks.length,
      content: type === "TEXT" ? { en: content.value || "", hi: "", mr: "" } : undefined,
      videoUrl: type === "VIDEO" ? content.value || "" : "",
      videoTitle: { en: "", hi: "", mr: "" },
      videoDuration: "",
      quizQuestions: [],
    });
  });

  if ((submodule.quizzes || []).length) {
    blocks.push({
      type: "QUIZ",
      order: blocks.length,
      content: { en: "", hi: "", mr: "" },
      videoUrl: "",
      videoTitle: { en: "", hi: "", mr: "" },
      videoDuration: "",
      quizQuestions: submodule.quizzes.map((quiz) => ({
        question: { en: quiz.question || "", hi: "", mr: "" },
        options: quiz.options || [],
        correctAnswer: quiz.correctAnswer || "",
      })),
    });
  }

  return blocks;
};

const getEffectiveBlocks = (submodule) => {
  const blocks = submodule.blocks || [];
  return blocks.length ? blocks : buildBlocksFromLegacy(submodule);
};

const toLessonPayload = (submodule) => ({
  _id: submodule._id,
  title: submodule.title,
  moduleId: submodule.moduleId,
  blocks: sortBlocks(getEffectiveBlocks(submodule)),
  contents: submodule.contents || [],
  quizzes: submodule.quizzes || [],
  updatedAt: submodule.updatedAt,
});

export const createSubmodule = async (req, res) => {
  try {
    const { moduleId, title } = req.body;
    const module = await getOwnedModule(moduleId, req.user);
    if (!module) return res.status(404).json({ error: "Module not found" });
    const submodule = await Submodule.create({ moduleId, title });
    await Module.findByIdAndUpdate(moduleId, { $push: { submodules: submodule._id } });
    res.status(201).json(submodule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateSubmodule = async (req, res) => {
  try {
    const existing = await getOwnedSubmodule(req.params.id, req.user);
    if (!existing) return res.status(404).json({ error: "Submodule not found" });
    const submodule = await Submodule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(submodule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteSubmodule = async (req, res) => {
  try {
    const submodule = await getOwnedSubmodule(req.params.id, req.user);
    if (!submodule) return res.status(404).json({ error: "Submodule not found" });
    await Submodule.findByIdAndDelete(submodule._id);
    await Module.findByIdAndUpdate(submodule.moduleId, { $pull: { submodules: submodule._id } });
    res.json({ message: "Submodule deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubmoduleContent = async (req, res) => {
  try {
    const submodule = await getOwnedSubmodule(req.params.id, req.user);
    if (!submodule) return res.status(404).json({ error: "Submodule not found" });
    res.json(toLessonPayload(submodule));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addContent = async (req, res) => {
  try {
    const { submoduleId, type, value } = req.body;
    const submodule = await getOwnedSubmodule(submoduleId, req.user);
    if (!submodule) return res.status(404).json({ error: "Submodule not found" });

    const blockType = type === "video" ? "VIDEO" : "TEXT";
    submodule.blocks.push({
      type: blockType,
      order: submodule.blocks.length,
      content: blockType === "TEXT" ? { en: String(value || ""), hi: "", mr: "" } : undefined,
      videoUrl: blockType === "VIDEO" ? String(value || "") : "",
    });
    submodule.contents = buildLegacyContent(submodule.blocks);
    submodule.quizzes = buildLegacyQuizzes(submodule.blocks);
    await submodule.save();

    res.json(toLessonPayload(submodule));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const saveBlocks = async (req, res) => {
  try {
    if (!Array.isArray(req.body.blocks)) {
      return res.status(400).json({ error: "blocks must be an array" });
    }

    const existing = await getOwnedSubmodule(req.params.id, req.user);
    if (!existing) return res.status(404).json({ error: "Submodule not found" });

    const incomingBlocks = req.body.blocks.length
      ? req.body.blocks
      : getEffectiveBlocks(existing);
    const blocks = incomingBlocks.map(normalizeBlock).map((block, index) => ({ ...block, order: index }));
    const contents = buildLegacyContent(blocks);
    const quizzes = buildLegacyQuizzes(blocks);

    const submodule = await Submodule.findByIdAndUpdate(
      req.params.id,
      { $set: { blocks, contents, quizzes } },
      { new: true, runValidators: true }
    );

    res.json(toLessonPayload(submodule));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const addBlock = async (req, res) => {
  try {
    const submodule = await getOwnedSubmodule(req.params.id, req.user);
    if (!submodule) return res.status(404).json({ error: "Submodule not found" });

    const nextBlock = normalizeBlock(req.body, submodule.blocks.length);
    submodule.blocks.push({ ...nextBlock, order: submodule.blocks.length });
    submodule.contents = buildLegacyContent(submodule.blocks);
    submodule.quizzes = buildLegacyQuizzes(submodule.blocks);
    await submodule.save();

    res.status(201).json(toLessonPayload(submodule));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const addQuiz = async (req, res) => {
  try {
    const { submoduleId, question, options, correctAnswer } = req.body;
    const submodule = await getOwnedSubmodule(submoduleId, req.user);
    if (!submodule) return res.status(404).json({ error: "Submodule not found" });

    submodule.blocks.push({
      type: "QUIZ",
      order: submodule.blocks.length,
      quizQuestions: [
        {
          question: { en: String(question || ""), hi: "", mr: "" },
          options: Array.isArray(options) ? options : [],
          correctAnswer: String(correctAnswer || ""),
        },
      ],
    });
    submodule.contents = buildLegacyContent(submodule.blocks);
    submodule.quizzes = buildLegacyQuizzes(submodule.blocks);
    await submodule.save();

    res.json(toLessonPayload(submodule));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
