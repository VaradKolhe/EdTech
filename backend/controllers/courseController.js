import mongoose from "mongoose";
import crypto from "crypto";
import path from "path";
import Course from "../models/Course.js";
import Category from "../models/Category.js";
import CertificateTemplate from "../models/CertificateTemplate.js";
import Enrollment from "../models/Enrollment.js";
import Rating from "../models/Rating.js";
import Quiz from "../models/Quiz.js";
import Payment from "../models/Payment.js";
import { checkCourseAccess } from "../utils/accessControl.js";
import {
  translateCourseContent,
  translateFullQuiz,
  translateLocalizedField,
} from "../services/courseTranslation.service.js";

const localized = (value = {}) => {
  if (typeof value === "string" || typeof value === "number") {
    return { en: String(value), hi: "", mr: "" };
  }

  return {
    en: String(value?.en || ""),
    hi: String(value?.hi || ""),
    mr: String(value?.mr || ""),
  };
};

const isOwnerOrAdmin = (course, user) =>
  user.role === "admin" ||
  String(course.instructorId?._id || course.instructorId) === String(user._id);

const getOwnedCourse = (courseId, user) => {
  const query = {
    _id: mongoose.Types.ObjectId.isValid(courseId) ? new mongoose.Types.ObjectId(String(courseId)) : courseId,
    ...(user.role === "instructor" ? { instructorId: user._id } : {}),
  };
  return Course.findOne(query)
    .populate("categoryId", "name slug")
    .populate("instructorId", "name email");
};

const getOwnedCourseByModule = (moduleId, user) => {
  const id = mongoose.Types.ObjectId.isValid(moduleId) ? new mongoose.Types.ObjectId(String(moduleId)) : moduleId;
  return Course.findOne({
    $or: [{ "modules._id": id }, { "modules.moduleId": id }],
    ...(user.role === "instructor" ? { instructorId: user._id } : {}),
  })
    .populate("categoryId", "name slug")
    .populate("instructorId", "name email");
};

const ensureCategoryTranslations = async (categoryId) => {
  if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) return;
  const category = await Category.findById(categoryId);
  if (!category) return;

  await translateLocalizedField(category.name);
  await translateLocalizedField(category.description);
  await category.save();
};

const normalizeBlock = (block = {}, index = 0) => {
  const id = block.blockId || block._id || new mongoose.Types.ObjectId();
  const normalized = {
    blockId: id,
    order: Number.isFinite(Number(block.order)) ? Number(block.order) : index,
    type: String(block.type || "TEXT").toUpperCase(),
    title: localized(block.title || block.videoTitle),
    textContent: localized(block.textContent || block.content),
    durationMinutes: Number(block.durationMinutes || block.videoDuration || 0),
    isPreview: Boolean(block.isPreview),
    quizId: block.quizId || undefined,
    isRequiredForCompletion: block.isRequiredForCompletion !== false,
  };
  
  if (block.video) {
    normalized.video = {
      type: block.video.type || null,
      url: block.video.url || "",
      provider: block.video.provider || null,
      originalName: block.video.originalName || "",
      storedName: block.video.storedName || "",
      mimeType: block.video.mimeType || "",
      size: Number(block.video.size || 0),
      uploadedAt: block.video.uploadedAt ? new Date(block.video.uploadedAt) : new Date()
    };
  } else if (block.videoUrl) {
    normalized.video = {
      type: "external",
      url: block.videoUrl,
      provider: "direct",
    };
  }
  
  return normalized;
};

const normalizeSubmodule = (submodule = {}, index = 0) => {
  const id = submodule.submoduleId || submodule._id || new mongoose.Types.ObjectId();
  return {
    _id: id,
    submoduleId: id,
    order: Number.isFinite(Number(submodule.order)) ? Number(submodule.order) : index,
    submoduleTitle: localized(submodule.submoduleTitle || submodule.title),
    submoduleDescription: localized(submodule.submoduleDescription || submodule.description),
    contentBlocks: Array.isArray(submodule.contentBlocks)
      ? submodule.contentBlocks.map(normalizeBlock)
      : [],
  };
};

const normalizeModule = (module = {}, index = 0) => {
  const id = module.moduleId || module._id || new mongoose.Types.ObjectId();
  return {
    _id: id,
    moduleId: id,
    order: Number.isFinite(Number(module.order)) ? Number(module.order) : index,
    moduleTitle: localized(module.moduleTitle || module.title),
    moduleDescription: localized(module.moduleDescription || module.description),
    submodules: Array.isArray(module.submodules)
      ? module.submodules.map(normalizeSubmodule)
      : [],
  };
};

const defaultCoursePayload = async (body, user) => {
  const category =
    body.categoryId && mongoose.Types.ObjectId.isValid(body.categoryId)
      ? body.categoryId
      : (await Category.findOne({ isActive: true }).sort({ createdAt: 1 }))?._id;
  if (!category) throw new Error("A valid categoryId is required");
  await ensureCategoryTranslations(category);

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
    // TC-11: Enforce teacher verification
    if (req.user.role === "instructor" && req.user.instructorProfile?.verification?.status !== "APPROVED") {
      return res.status(403).json({ message: "Account not verified. Await admin approval" });
    }

    // TC-10: Strict title validation
    const titleValue = req.body.title;
    let titleEn = "";
    if (typeof titleValue === "string") {
      titleEn = titleValue;
    } else if (titleValue && typeof titleValue === "object") {
      titleEn = titleValue.en || "";
    }

    if (!String(titleEn || "").trim()) {
      return res.status(400).json({ message: "Course title is required and cannot be empty" });
    }

    const payload = await defaultCoursePayload(req.body, req.user);
    
    // Auto-translate content before saving
    await translateCourseContent(payload);
    
    const course = await Course.create(payload);
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to create course" });
  }
};

export const getCourses = async (req, res) => {
  try {
    const { sortBy = "updatedAt", order = "desc" } = req.query;
    const filter = req.user.role === "instructor" ? { instructorId: req.user._id } : {};
    
    const sortField = sortBy === "enrollments" ? "metrics.totalEnrollments" : 
                      sortBy === "rating" ? "metrics.averageRating" : sortBy;
    const sortOrder = order === "asc" ? 1 : -1;

    const courses = await Course.find(filter)
      .populate("categoryId", "name slug")
      .populate("instructorId", "name email instructorProfile")
      .sort({ [sortField]: sortOrder });
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
    const { allowed, status, message, course } = await checkCourseAccess(req.user, req.params.id);
    if (!allowed) return res.status(status).json({ message });
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

    // Trigger translation
    await translateCourseContent(allowed, existing.toObject());

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
    const { allowed, status, message, course } = await checkCourseAccess(req.user, req.params.courseId);
    if (!course) return res.status(status).json({ message });

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
    const { allowed, status, message, course } = await checkCourseAccess(req.user, req.params.courseId);
    if (!allowed) return res.status(status).json({ message });

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
    await translateCourseContent(course);
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to save content" });
  }
};

// --- Module CRUD ---

export const addModule = async (req, res) => {
  try {
    const { courseId, title, moduleNumber } = req.body;
    console.log("DEBUG: addModule body:", { courseId, title, moduleNumber });
    const course = await getOwnedCourse(courseId, req.user);
    if (!course) {
      console.log("DEBUG: addModule course not found for ID:", courseId);
      return res.status(404).json({ message: "Course not found" });
    }

    const moduleId = new mongoose.Types.ObjectId();
    const newModule = {
      _id: moduleId,
      moduleId: moduleId,
      order: Number(moduleNumber) || course.modules.length,
      moduleTitle: localized(title),
      submodules: []
    };
    await translateLocalizedField(newModule.moduleTitle);

    course.modules.push(newModule);
    await course.save();
    console.log("DEBUG: addModule success:", moduleId);
    res.status(201).json(newModule);
  } catch (error) {
    console.error("DEBUG: addModule error:", error);
    res.status(400).json({ message: error.message || "Failed to add module" });
  }
};

export const updateModule = async (req, res) => {
  try {
    const { id: moduleId } = req.params;
    const { title } = req.body;

    const course = await Course.findOne({ $or: [{ "modules._id": moduleId }, { "modules.moduleId": moduleId }] });
    if (!course) return res.status(404).json({ message: "Module not found" });

    if (!isOwnerOrAdmin(course, req.user)) return res.status(403).json({ message: "Not authorized" });

    const mod = course.modules.find(m => String(m._id) === String(moduleId) || String(m.moduleId) === String(moduleId));
    mod.moduleTitle = localized(title);
    await translateLocalizedField(mod.moduleTitle, true);
    await course.save();
    res.json(mod);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update module" });
  }
};

export const deleteModule = async (req, res) => {
  try {
    const { id: moduleId } = req.params;
    const course = await Course.findOne({ $or: [{ "modules._id": moduleId }, { "modules.moduleId": moduleId }] });
    if (!course) return res.status(404).json({ message: "Module not found" });

    if (!isOwnerOrAdmin(course, req.user)) return res.status(403).json({ message: "Not authorized" });

    course.modules = course.modules.filter(m => String(m._id) !== String(moduleId) && String(m.moduleId) !== String(moduleId));
    await course.save();
    res.json({ message: "Module deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to delete module" });
  }
};

// --- Submodule CRUD ---

export const addSubmodule = async (req, res) => {
  try {
    const courseId = req.params.courseId || req.body.courseId;
    const moduleId = req.params.moduleId || req.body.moduleId;
    const { title, submoduleDescription, order, contentBlocks, blocks } = req.body;

    if (!courseId || !moduleId) {
      return res.status(400).json({ message: "courseId and moduleId are required" });
    }

    let course = await getOwnedCourse(courseId, req.user);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let mod = course.modules.find(m => String(m._id) === String(moduleId) || String(m.moduleId) === String(moduleId));
    
    if (!mod) {
      const actualCourse = await getOwnedCourseByModule(moduleId, req.user);
      if (!actualCourse) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      course = actualCourse;
      mod = course.modules.find(m => String(m._id) === String(moduleId) || String(m.moduleId) === String(moduleId));
    }

    const submoduleId = new mongoose.Types.ObjectId();
    const newSub = {
      _id: submoduleId,
      submoduleId: submoduleId,
      submoduleTitle: localized(title),
      submoduleDescription: localized(submoduleDescription),
      order: Number.isFinite(Number(order)) ? Number(order) : mod.submodules.length,
      contentBlocks: Array.isArray(contentBlocks || blocks)
        ? (contentBlocks || blocks).map(normalizeBlock)
        : []
    };
    await translateLocalizedField(newSub.submoduleTitle);
    await translateLocalizedField(newSub.submoduleDescription);
    for (const block of newSub.contentBlocks) {
      await translateLocalizedField(block.title);
      if (block.type === "TEXT") {
        await translateLocalizedField(block.textContent);
      }
    }

    mod.submodules.push(newSub);
    await course.save();

    res.status(201).json({
      success: true,
      submodule: newSub,
      moduleId: mod._id || mod.moduleId,
      courseId: course._id
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to add submodule" });
  }
};

export const updateSubmodule = async (req, res) => {
  try {
    const { id: submoduleId } = req.params;
    const { title } = req.body;

    const course = await Course.findOne({ $or: [{ "modules.submodules._id": submoduleId }, { "modules.submodules.submoduleId": submoduleId }] });
    if (!course) return res.status(404).json({ message: "Submodule not found" });

    if (!isOwnerOrAdmin(course, req.user)) return res.status(403).json({ message: "Not authorized" });

    let updatedSub = null;
    for (const m of course.modules) {
      const sub = m.submodules.find(s => String(s._id) === String(submoduleId) || String(s.submoduleId) === String(submoduleId));
      if (sub) {
        sub.submoduleTitle = localized(title);
        await translateLocalizedField(sub.submoduleTitle, true);
        updatedSub = sub;
      }
    }

    await course.save();
    res.json(updatedSub);
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update submodule" });
  }
};

export const deleteSubmodule = async (req, res) => {
  try {
    const { id: submoduleId } = req.params;
    const course = await Course.findOne({ $or: [{ "modules.submodules._id": submoduleId }, { "modules.submodules.submoduleId": submoduleId }] });
    if (!course) return res.status(404).json({ message: "Submodule not found" });

    if (!isOwnerOrAdmin(course, req.user)) return res.status(403).json({ message: "Not authorized" });

    let targetModuleId = null;
    course.modules.forEach(m => {
      const initialLen = m.submodules.length;
      m.submodules = m.submodules.filter(s => String(s._id) !== String(submoduleId) && String(s.submoduleId) !== String(submoduleId));
      if (m.submodules.length < initialLen) {
        targetModuleId = m._id || m.moduleId;
      }
    });

    await course.save();
    res.json({ message: "Submodule deleted", id: submoduleId, moduleId: targetModuleId });
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to delete submodule" });
  }
};

export const getSubmoduleBlocks = async (req, res) => {
  try {
    const { id: submoduleId } = req.params;
    const course = await Course.findOne({ $or: [{ "modules.submodules._id": submoduleId }, { "modules.submodules.submoduleId": submoduleId }] });
    if (!course) return res.status(404).json({ message: "Submodule not found" });

    let targetSub = null;
    course.modules.forEach(m => {
      const sub = m.submodules.find(s => String(s._id) === String(submoduleId) || String(s.submoduleId) === String(submoduleId));
      if (sub) targetSub = sub;
    });

    // Populate quizzes for each QUIZ block
    const blocksWithQuizzes = await Promise.all(targetSub.contentBlocks.map(async (block) => {
      const b = block.toObject();
      if (b.type === "QUIZ" && b.quizId) {
        const quiz = await Quiz.findById(b.quizId);
        if (quiz) {
          b.quizQuestions = quiz.questions.map(q => ({
            questionId: q.questionId,
            question: q.questionText,
            correctAnswer: "", // Don't expose this if not needed, but editor might need it
            correctAnswerIndex: q.correctAnswerIndex,
            options: q.options.map(o => o.text)
          }));
          // For editor, we actually need the correct answers
          // Find the correct option text
          b.quizQuestions.forEach((q, idx) => {
            const quizQ = quiz.questions[idx];
            const correctOpt = quizQ.options.find(o => String(o.optionId) === String(quizQ.correctOptionId));
            if (correctOpt) q.correctAnswer = correctOpt.text;
          });
        }
      }
      return b;
    }));

    res.json({
      id: submoduleId,
      blocks: blocksWithQuizzes.sort((a, b) => a.order - b.order),
      title: targetSub.submoduleTitle,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch blocks" });
  }
};

export const updateSubmoduleBlocks = async (req, res) => {
  try {
    const { id: submoduleId } = req.params;
    const { blocks } = req.body;

    const course = await Course.findOne({ $or: [{ "modules.submodules._id": submoduleId }, { "modules.submodules.submoduleId": submoduleId }] });
    if (!course) return res.status(404).json({ message: "Course containing submodule not found" });

    if (!isOwnerOrAdmin(course, req.user)) {
      return res.status(403).json({ message: "Not authorized to edit this course" });
    }

    let targetSubmodule = null;
    let targetModule = null;
    for (const mod of course.modules) {
      const sub = mod.submodules.find((s) => String(s._id) === String(submoduleId) || String(s.submoduleId) === String(submoduleId));
      if (sub) {
        targetSubmodule = sub;
        targetModule = mod;
        break;
      }
    }

    if (!targetSubmodule) return res.status(404).json({ message: "Submodule not found in course" });

    const processedBlocks = [];
    for (const b of blocks) {
      const blockData = {
        blockId: b.blockId || new mongoose.Types.ObjectId(),
        order: b.order,
        type: b.type,
        title: localized(b.title || b.videoTitle || b.content),
        textContent: localized(b.textContent || b.content),
        durationMinutes: Number(b.videoDuration || b.durationMinutes || 0),
        isPreview: Boolean(b.isPreview),
        isRequiredForCompletion: b.isRequiredForCompletion !== false,
      };
      await translateLocalizedField(blockData.title);
      if (blockData.type === "TEXT") {
        await translateLocalizedField(blockData.textContent);
      }

      if (b.video) {
        blockData.video = {
          type: b.video.type || null,
          url: b.video.url || "",
          provider: b.video.provider || null,
          originalName: b.video.originalName || "",
          storedName: b.video.storedName || "",
          mimeType: b.video.mimeType || "",
          size: Number(b.video.size || 0),
          uploadedAt: b.video.uploadedAt ? new Date(b.video.uploadedAt) : new Date()
        };
      } else if (b.videoUrl) {
        blockData.video = {
          type: "external",
          url: b.videoUrl,
          provider: "direct",
        };
      }

      if (b.type === "QUIZ" && b.quizQuestions?.length) {
        const quizPayload = {
          courseId: course._id,
          moduleId: targetModule.moduleId,
          submoduleId: targetSubmodule.submoduleId,
          title: blockData.title,
          questions: b.quizQuestions.map((q) => {
            const questionId = q.questionId || new mongoose.Types.ObjectId();
            const options = q.options.map((opt) => ({
              optionId: new mongoose.Types.ObjectId(),
              text: localized(opt),
            }));

            const correctAnswerIndex = Number(q.correctAnswerIndex);
            // Support both direct text and object-based options
            const correctTextEn = typeof q.correctAnswer === 'string' ? q.correctAnswer : q.correctAnswer?.en;
            
            const correctOpt = Number.isInteger(correctAnswerIndex) && correctAnswerIndex >= 0
              ? options[correctAnswerIndex] || options[0]
              : options.find((opt) => (opt.text.en === correctTextEn)) || options[0];

            return {
              questionId,
              questionText: localized(q.question),
              options,
              correctAnswerIndex: Number.isInteger(correctAnswerIndex) ? correctAnswerIndex : options.indexOf(correctOpt),
              correctOptionId: correctOpt.optionId,
              marks: 1,
            };
          }),
          totalMarks: b.quizQuestions.length,
          passingMarks: Math.ceil(b.quizQuestions.length / 2),
        };

        let quiz;
        if (b.quizId && mongoose.Types.ObjectId.isValid(b.quizId)) {
          quiz = await Quiz.findByIdAndUpdate(b.quizId, quizPayload, { new: true, upsert: true });
        } else {
          quiz = await Quiz.create(quizPayload);
        }
        await translateFullQuiz(quiz);
        await quiz.save();
        blockData.quizId = quiz._id;
        // Keep quizQuestions in blockData for the response
        blockData.quizQuestions = b.quizQuestions;
      }

      processedBlocks.push(blockData);
    }

    targetSubmodule.contentBlocks = processedBlocks;
    await course.save();

    res.json({ _id: submoduleId, blocks: processedBlocks });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update blocks" });
  }
};

// Instructor: Submit for Review
export const submitCourseForReview = async (req, res) => {
  try {
    const course = await getOwnedCourse(req.params.id, req.user);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!["DRAFT", "REJECTED"].includes(course.status)) {
      return res.status(400).json({ message: "Course must be in DRAFT or REJECTED status to submit" });
    }

    course.status = "PENDING_REVIEW";
    course.submittedAt = new Date();
    await course.save();

    res.json({ message: "Course submitted for review", course });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to submit course" });
  }
};

// Instructor: Create Platform Fee Order
export const createPlatformFeeOrder = async (req, res) => {
  try {
    const course = await getOwnedCourse(req.params.courseId, req.user);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.status !== "PAYMENT_PENDING") {
      return res.status(400).json({ message: "Course is not in payment pending state" });
    }

    // Platform fee (Static 499 INR for now, can be env var)
    const PLATFORM_FEE = 499;
    const amount = Math.round(PLATFORM_FEE * 100);

    let order = null;
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (keyId && keySecret) {
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `pub_${course._id.toString().slice(-8)}_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(502).json({ message: "Razorpay order creation failed", details: errText });
      }
      order = await response.json();
    } else {
      order = { id: `order_dev_${Date.now()}`, amount, currency: "INR", devMode: true };
    }

    const payment = await Payment.create({
      userId: req.user._id,
      courseId: course._id,
      amount: PLATFORM_FEE,
      currency: "INR",
      provider: "RAZORPAY",
      razorpayOrderId: order.id,
      status: "CREATED",
      purpose: "COURSE_PUBLISHING_FEE",
    });

    res.status(201).json({ order, payment, keyId: keyId || "" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create fee order" });
  }
};

// Instructor: Verify Platform Fee
export const verifyPlatformFee = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const courseId = req.params.courseId;

    const payment = await Payment.findOne({
      userId: req.user._id,
      courseId,
      razorpayOrderId: razorpay_order_id,
      purpose: "COURSE_PUBLISHING_FEE",
      status: "CREATED",
    });

    if (!payment) return res.status(404).json({ message: "Payment record not found" });

    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    const devOrder = String(razorpay_order_id || "").startsWith("order_dev_");
    
    const valid = keySecret
      ? crypto
          .createHmac("sha256", keySecret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest("hex") === razorpay_signature
      : devOrder;

    if (!valid) {
      payment.status = "FAILED";
      payment.failureReason = "Invalid signature";
      await payment.save();
      return res.status(400).json({ message: "Payment verification failed" });
    }

    payment.status = "SUCCESS";
    payment.razorpayPaymentId = razorpay_payment_id || "";
    payment.razorpaySignature = razorpay_signature || "";
    payment.paidAt = new Date();
    await payment.save();

    // Update course status to PUBLISHED
    const course = await Course.findById(courseId);
    course.status = "PUBLISHED";
    course.platformFeePaid = true;
    course.platformFeePaymentId = payment._id;
    course.publishedAt = new Date();
    await course.save();

    res.json({ message: "Course published successfully", course });
  } catch (error) {
    res.status(500).json({ message: error.message || "Verification failed" });
  }
};

export const uploadVideoContent = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No video file provided" });
    const { courseId, moduleId, submoduleId } = req.params;

    if (courseId && courseId !== "draft") {
      const course = await getOwnedCourse(courseId, req.user);
      if (!course) return res.status(404).json({ message: "Course not found or unauthorized" });
    }

    const videoUrl = `/uploads/${path.relative(path.join(process.cwd(), "uploads"), req.file.path).replace(/\\/g, "/")}`;

    res.json({
      message: "Video uploaded successfully",
      video: {
        type: "upload",
        url: videoUrl,
        provider: "local",
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Video upload failed" });
  }
};
