import mongoose from "mongoose";
import Course from "../models/Course.js";
import Category from "../models/Category.js";
import CertificateTemplate from "../models/CertificateTemplate.js";
import Enrollment from "../models/Enrollment.js";
import Rating from "../models/Rating.js";

const localized = (value = {}) => ({
  en: String(value.en || value || ""),
  hi: String(value.hi || ""),
  mr: String(value.mr || ""),
});

const isOwnerOrAdmin = (course, user) =>
  user.role === "admin" || String(course.instructorId) === String(user._id);

const getOwnedCourse = (courseId, user) =>
  Course.findOne({
    _id: courseId,
    ...(user.role === "instructor" ? { instructorId: user._id } : {}),
  })
    .populate("categoryId", "name slug")
    .populate("instructorId", "name email");

const normalizeBlock = (block = {}, index = 0) => ({
  blockId: block.blockId || new mongoose.Types.ObjectId(),
  order: Number.isFinite(Number(block.order)) ? Number(block.order) : index,
  type: String(block.type || "TEXT").toUpperCase(),
  title: localized(block.title),
  textContent: localized(block.textContent),
  videoUrl: String(block.videoUrl || ""),
  videoFileName: String(block.videoFileName || ""),
  durationMinutes: Number(block.durationMinutes || 0),
  isPreview: Boolean(block.isPreview),
  quizId: block.quizId || undefined,
  isRequiredForCompletion: block.isRequiredForCompletion !== false,
});

const normalizeSubmodule = (submodule = {}, index = 0) => ({
  submoduleId: submodule.submoduleId || new mongoose.Types.ObjectId(),
  order: Number.isFinite(Number(submodule.order)) ? Number(submodule.order) : index,
  submoduleTitle: localized(submodule.submoduleTitle),
  submoduleDescription: localized(submodule.submoduleDescription),
  contentBlocks: Array.isArray(submodule.contentBlocks)
    ? submodule.contentBlocks.map(normalizeBlock)
    : [],
});

const normalizeModule = (module = {}, index = 0) => ({
  moduleId: module.moduleId || new mongoose.Types.ObjectId(),
  order: Number.isFinite(Number(module.order)) ? Number(module.order) : index,
  moduleTitle: localized(module.moduleTitle),
  moduleDescription: localized(module.moduleDescription),
  submodules: Array.isArray(module.submodules)
    ? module.submodules.map(normalizeSubmodule)
    : [],
});

const defaultCoursePayload = async (body, user) => {
  const category =
    body.categoryId && mongoose.Types.ObjectId.isValid(body.categoryId)
      ? body.categoryId
      : (await Category.findOne({ isActive: true }).sort({ createdAt: 1 }))?._id;
  if (!category) throw new Error("A valid categoryId is required");

  const certificateTemplateId =
    body.certificateTemplateId ||
    (await CertificateTemplate.findOne({ isActive: true, isDefault: true }))?._id;

  return {
    title: localized(body.title),
    description: localized(body.description),
    shortDescription: localized(body.shortDescription),
    languageAvailable: body.languageAvailable?.length ? body.languageAvailable : ["en"],
    categoryId: category,
    tags: {
      en: body.tags?.en || [],
      hi: body.tags?.hi || [],
      mr: body.tags?.mr || [],
    },
    difficulty: body.difficulty || "Beginner",
    price: Number(body.price || 0),
    currency: "INR",
    isPaid: Number(body.price || 0) > 0,
    instructorId: user._id,
    thumbnailUrl: body.thumbnailUrl || "",
    certificateTemplateId,
    completionRules: {
      requireAllContentBlocksCompleted:
        body.completionRules?.requireAllContentBlocksCompleted !== false,
      requireAllQuizzesPassed: Boolean(body.completionRules?.requireAllQuizzesPassed),
      minimumQuizPassingPercentage:
        Number(body.completionRules?.minimumQuizPassingPercentage || 50),
    },
    modules: Array.isArray(body.modules) ? body.modules.map(normalizeModule) : [],
    recommendationFeatures: {
      stream: body.recommendationFeatures?.stream || "",
      skillLevel: body.recommendationFeatures?.skillLevel || body.difficulty || "Beginner",
      targetAgeGroups: body.recommendationFeatures?.targetAgeGroups || [],
      targetEducationLevels: body.recommendationFeatures?.targetEducationLevels || [],
      careerGoals: body.recommendationFeatures?.careerGoals || [],
      keywords: body.recommendationFeatures?.keywords || [],
    },
    translationStatus: {
      hi: body.translationStatus?.hi || "PENDING",
      mr: body.translationStatus?.mr || "PENDING",
    },
    metrics: body.metrics || {},
    status: body.status || "DRAFT",
  };
};

export const createCourse = async (req, res) => {
  try {
    const payload = await defaultCoursePayload(req.body, req.user);
    const course = await Course.create(payload);
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to create course" });
  }
};

export const getCourses = async (req, res) => {
  try {
    const filter = req.user.role === "instructor" ? { instructorId: req.user._id } : {};
    const courses = await Course.find(filter)
      .populate("categoryId", "name slug")
      .populate("instructorId", "name email")
      .sort({ updatedAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch courses" });
  }
};

export const getInstructorStats = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const courses = await Course.find({ instructorId });
    const courseIds = courses.map((c) => c._id);

    const [enrollmentCount, ratingStats] = await Promise.all([
      Enrollment.countDocuments({
        courseId: { $in: courseIds },
        status: { $in: ["ENROLLED", "COMPLETED"] },
      }),
      Rating.aggregate([
        { $match: { courseId: { $in: courseIds } } },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),
    ]);

    res.json({
      courses: courses.length,
      enrollments: enrollmentCount,
      averageRating: ratingStats[0]?.avg ? Number(ratingStats[0].avg.toFixed(1)) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch stats" });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await getOwnedCourse(req.params.id, req.user);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!isOwnerOrAdmin(course, req.user)) return res.status(403).json({ message: "Not authorized" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch course" });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const existing = await getOwnedCourse(req.params.id, req.user);
    if (!existing) return res.status(404).json({ message: "Course not found" });
    const allowed = await defaultCoursePayload({ ...existing.toObject(), ...req.body }, existing);
    delete allowed.instructorId;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      allowed,
      { returnDocument: "after", runValidators: true }
    );
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update course" });
  }
};

export const getCourseOutline = async (req, res) => {
  try {
    const course = await getOwnedCourse(req.params.courseId, req.user);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({
      course: {
        _id: course._id,
        title: course.title,
        status: course.status,
        modules: course.modules
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((module) => ({
            moduleId: module.moduleId,
            order: module.order,
            moduleTitle: module.moduleTitle,
            submodules: module.submodules
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((submodule) => ({
                submoduleId: submodule.submoduleId,
                order: submodule.order,
                submoduleTitle: submodule.submoduleTitle,
                blockCount: submodule.contentBlocks.length,
              })),
          })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch outline" });
  }
};

export const getSubmoduleContent = async (req, res) => {
  try {
    const course = await getOwnedCourse(req.params.courseId, req.user);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const module = course.modules.find(
      (item) => String(item.moduleId) === String(req.params.moduleId)
    );
    const submodule = module?.submodules.find(
      (item) => String(item.submoduleId) === String(req.params.submoduleId)
    );
    if (!module || !submodule) {
      return res.status(404).json({ message: "Submodule not found" });
    }
    res.json({
      moduleId: module.moduleId,
      submoduleId: submodule.submoduleId,
      submoduleTitle: submodule.submoduleTitle,
      submoduleDescription: submodule.submoduleDescription,
      contentBlocks: submodule.contentBlocks.slice().sort((a, b) => a.order - b.order),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch content" });
  }
};

export const saveCourseContent = async (req, res) => {
  try {
    const course = await getOwnedCourse(req.params.courseId, req.user);
    if (!course) return res.status(404).json({ message: "Course not found" });
    course.modules = Array.isArray(req.body.modules)
      ? req.body.modules.map(normalizeModule)
      : course.modules;
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to save content" });
  }
};
