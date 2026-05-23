import crypto from "crypto";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Payment from "../models/Payment.js";
import Rating from "../models/Rating.js";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";
import UserActivity from "../models/UserActivity.js";
import RecommendationFeedback from "../models/RecommendationFeedback.js";
import { createNotification } from "../services/notificationService.js";
import { queueCertificateGeneration } from "../services/certificateService.js";

const LANGS = ["en", "hi", "mr"];
const REQUIRED_PROFILE_FIELDS = [
  "ageGroup",
  "educationLevel",
  "preferredStreams",
  "skillLevel",
  "careerGoal",
  "budgetPreference",
  "preferredDifficulty",
  "preferredLanguage",
];

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const toObjectId = (value) => new mongoose.Types.ObjectId(String(value));
const langFromRequest = (req) =>
  LANGS.includes(req.query.language) ? req.query.language : "en";

const localize = (value, lang = "en", fallback = "") =>
  value?.[lang] || value?.en || value?.hi || value?.mr || fallback;

const isProfileComplete = (profile = {}) =>
  REQUIRED_PROFILE_FIELDS.every((field) => {
    const value = profile[field];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });

const publishedFilter = { status: "PUBLISHED" };

const coursePopulate = [
  { path: "instructorId", select: "name email instructorProfile" },
  { path: "categoryId", select: "name slug" },
];

const flattenBlocks = (course) =>
  (course.modules || []).flatMap((module) =>
    (module.submodules || []).flatMap((submodule) =>
      (submodule.contentBlocks || []).map((block) => ({
        moduleId: module.moduleId,
        submoduleId: submodule.submoduleId,
        blockId: block.blockId,
        blockType: block.type,
        block,
      }))
    )
  );

const calculateProgress = (course, completedBlocks = []) => {
  const required = flattenBlocks(course).filter(
    ({ block }) => block.isRequiredForCompletion !== false
  );
  if (!required.length) return 0;
  const completed = new Set(completedBlocks.map((item) => String(item.blockId)));
  return Math.min(
    100,
    Math.round((required.filter((item) => completed.has(String(item.blockId))).length / required.length) * 100)
  );
};

const normalizeCourse = (course, lang = "en", enrollment = null) => ({
  _id: course._id,
  title: localize(course.title, lang, "Untitled course"),
  description: localize(course.description, lang, ""),
  shortDescription: localize(course.shortDescription, lang, ""),
  thumbnailUrl: course.thumbnailUrl || "",
  instructor: course.instructorId
    ? {
        _id: course.instructorId._id,
        name: course.instructorId.name,
        email: course.instructorId.email,
      }
    : null,
  category: localize(course.categoryId?.name, lang, "General"),
  categoryId: course.categoryId?._id || course.categoryId,
  tags: course.tags?.[lang] || course.tags?.en || [],
  difficulty: course.difficulty,
  price: course.price,
  currency: course.currency,
  isPaid: course.isPaid,
  languageAvailable: course.languageAvailable || [],
  averageRating: course.metrics?.averageRating || 0,
  totalRatings: course.metrics?.totalRatings || 0,
  totalEnrollments: course.metrics?.totalEnrollments || 0,
  status: course.status,
  enrollment: enrollment
    ? {
        _id: enrollment._id,
        status: enrollment.status,
        accessStatus: enrollment.accessStatus,
        progressPercentage: enrollment.progressPercentage,
        lastAccessed: enrollment.lastAccessed,
      }
    : null,
});

const normalizeCourseDetail = (course, lang = "en", enrollment = null) => ({
  ...normalizeCourse(course, lang, enrollment),
  modules: (course.modules || [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((module) => ({
      moduleId: module.moduleId,
      order: module.order,
      title: localize(module.moduleTitle, lang, "Module"),
      description: localize(module.moduleDescription, lang, ""),
      submodules: (module.submodules || [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((submodule) => ({
          submoduleId: submodule.submoduleId,
          order: submodule.order,
          title: localize(submodule.submoduleTitle, lang, "Lesson"),
          description: localize(submodule.submoduleDescription, lang, ""),
          contentBlocks: (submodule.contentBlocks || [])
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((block) => ({
              blockId: block.blockId,
              order: block.order,
              type: block.type,
              title: localize(block.title, lang, block.type),
              textContent: localize(block.textContent, lang, ""),
              videoUrl: block.videoUrl,
              videoFileName: block.videoFileName,
              durationMinutes: block.durationMinutes,
              isPreview: block.isPreview,
              quizId: block.quizId,
              isRequiredForCompletion: block.isRequiredForCompletion,
            })),
        })),
    })),
});

const logActivity = async (payload) =>
  UserActivity.create(payload).catch(() => null);

const findPublishedCourse = (courseId) => {
  if (!isObjectId(courseId)) return null;
  return Course.findOne({ _id: courseId, ...publishedFilter }).populate(coursePopulate);
};

const findActiveEnrollment = (userId, courseId) =>
  Enrollment.findOne({
    userId,
    courseId,
    accessStatus: "ACTIVE",
    status: { $in: ["ENROLLED", "COMPLETED"] },
  });

const buildCourseFilter = (query = {}) => {
  const filter = { ...publishedFilter };
  if (query.category && isObjectId(query.category)) filter.categoryId = query.category;
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.language) filter.languageAvailable = query.language;
  if (query.pricing === "free") filter.isPaid = false;
  if (query.pricing === "paid") filter.isPaid = true;
  if (query.minPrice || query.maxPrice) {
    filter.price = {
      ...(query.minPrice ? { $gte: Number(query.minPrice) } : {}),
      ...(query.maxPrice ? { $lte: Number(query.maxPrice) } : {}),
    };
  }
  if (query.rating) filter["metrics.averageRating"] = { $gte: Number(query.rating) };
  if (query.search || query.query) {
    const pattern = { $regex: query.search || query.query, $options: "i" };
    filter.$or = [
      { "title.en": pattern },
      { "title.hi": pattern },
      { "title.mr": pattern },
      { "description.en": pattern },
      { "shortDescription.en": pattern },
      { "recommendationFeatures.keywords": pattern },
    ];
  }
  return filter;
};

export const getStudentProfile = async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
};

export const getOnboardingStatus = async (req, res) => {
  res.json({ complete: isProfileComplete(req.user.profile), profile: req.user.profile });
};

export const saveOnboardingProfile = async (req, res) => {
  try {
    const profile = {
      ageGroup: req.body.ageGroup,
      educationLevel: req.body.educationLevel,
      preferredStreams: Array.isArray(req.body.preferredStreams)
        ? req.body.preferredStreams
        : [],
      skillLevel: req.body.skillLevel,
      careerGoal: req.body.careerGoal,
      budgetPreference: req.body.budgetPreference,
      preferredDifficulty: req.body.preferredDifficulty,
      preferredLanguage: req.body.preferredLanguage,
    };
    if (!isProfileComplete(profile)) {
      return res.status(400).json({ message: "All onboarding selections are required" });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profile },
      { returnDocument: "after", runValidators: true }
    );
    res.json({ complete: true, profile: user.profile });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to save onboarding profile" });
  }
};

export const getStudentDashboardData = async (req, res) => {
  try {
    const lang = langFromRequest(req);
    const enrollments = await Enrollment.find({
      userId: req.user._id,
      accessStatus: "ACTIVE",
      status: { $in: ["ENROLLED", "COMPLETED"] },
    })
      .populate({ path: "courseId", populate: coursePopulate })
      .sort({ updatedAt: -1 });

    const enrolledIds = enrollments.map((item) => item.courseId?._id).filter(Boolean);
    const recommendations = await Course.find({
      ...publishedFilter,
      _id: { $nin: enrolledIds },
    })
      .populate(coursePopulate)
      .sort({
        "metrics.feedbackScore": -1,
        "metrics.popularityScore": -1,
        "metrics.averageRating": -1,
        createdAt: -1,
      })
      .limit(6);

    const recentActivity = await UserActivity.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const validEnrollments = enrollments.filter((item) => item.courseId);
    res.json({
      enrolledCourses: validEnrollments.map((item) => ({
        ...normalizeCourse(item.courseId, lang, item),
        progress: item.progressPercentage,
        enrollmentStatus: item.status,
        displayStatus: item.status === "COMPLETED" ? "Completed" : "Enrolled",
      })),
      continueLearning: validEnrollments
        .filter((item) => item.status === "ENROLLED")
        .slice(0, 4)
        .map((item) => normalizeCourse(item.courseId, lang, item)),
      recommendations: recommendations.map((course) => normalizeCourse(course, lang)),
      recentActivity,
      stats: {
        enrolledCount: validEnrollments.filter((item) => item.status === "ENROLLED").length,
        completedCount: validEnrollments.filter((item) => item.status === "COMPLETED").length,
        overallProgress: validEnrollments.length
          ? Math.round(
              validEnrollments.reduce((sum, item) => sum + item.progressPercentage, 0) /
                validEnrollments.length
            )
          : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch dashboard" });
  }
};

export const getStudentEnrollments = async (req, res) => {
  try {
    const lang = langFromRequest(req);
    const filter = {
      userId: req.user._id,
      accessStatus: "ACTIVE",
      status: { $in: ["ENROLLED", "COMPLETED"] },
    };
    if (req.query.status === "enrolled") filter.status = "ENROLLED";
    if (req.query.status === "completed") filter.status = "COMPLETED";

    const enrollments = await Enrollment.find(filter)
      .populate({ path: "courseId", populate: coursePopulate })
      .sort({ updatedAt: -1 });

    let items = enrollments
      .filter((item) => item.courseId)
      .map((item) => ({
        ...normalizeCourse(item.courseId, lang, item),
        progress: item.progressPercentage,
        enrollmentId: item._id,
        enrollmentStatus: item.status,
        displayStatus: item.status === "COMPLETED" ? "Completed" : "Enrolled",
        enrolledAt: item.enrolledAt,
      }));

    if (req.query.difficulty) items = items.filter((item) => item.difficulty === req.query.difficulty);
    if (req.query.language) items = items.filter((item) => item.languageAvailable.includes(req.query.language));
    if (req.query.pricing === "free") items = items.filter((item) => !item.isPaid);
    if (req.query.pricing === "paid") items = items.filter((item) => item.isPaid);
    if (req.query.minProgress) items = items.filter((item) => item.progress >= Number(req.query.minProgress));

    res.json({ enrollments: items });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch enrollments" });
  }
};

export const getStudentEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate({ path: "courseId", populate: coursePopulate });
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
    res.json({
      enrollment,
      course: normalizeCourseDetail(enrollment.courseId, langFromRequest(req), enrollment),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch enrollment" });
  }
};

export const getStudentCourses = async (req, res) => {
  try {
    const lang = langFromRequest(req);
    const sortMap = {
      popularity: { "metrics.totalEnrollments": -1 },
      rating: { "metrics.averageRating": -1 },
      newest: { createdAt: -1 },
      priceLow: { price: 1 },
      priceHigh: { price: -1 },
    };
    const courses = await Course.find(buildCourseFilter(req.query))
      .populate(coursePopulate)
      .sort(sortMap[req.query.sort] || sortMap.newest)
      .limit(Math.min(Number(req.query.limit || 50), 100));
    const enrollments = await Enrollment.find({
      userId: req.user._id,
      courseId: { $in: courses.map((course) => course._id) },
    });
    const enrollmentMap = new Map(enrollments.map((item) => [String(item.courseId), item]));
    res.json({
      courses: courses.map((course) =>
        normalizeCourse(course, lang, enrollmentMap.get(String(course._id)))
      ),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch courses" });
  }
};

export const searchStudentCourses = async (req, res) => {
  try {
    const query = String(req.query.query || req.query.q || "").trim();
    const lang = langFromRequest(req);
    const completed = await Enrollment.find({
      userId: req.user._id,
      status: "COMPLETED",
    }).select("courseId");
    const courses = await Course.find({
      ...buildCourseFilter({ ...req.query, query }),
      _id: { $nin: completed.map((item) => item.courseId) },
    })
      .populate(coursePopulate)
      .sort({
        "metrics.averageRating": -1,
        "metrics.totalEnrollments": -1,
        createdAt: -1,
      })
      .limit(Math.min(Number(req.query.limit || 20), 50));

    if (query) {
      await logActivity({
        userId: req.user._id,
        activityType: "SEARCH",
        searchQuery: query,
        metadata: { language: lang, page: "search" },
      });
    }
    res.json({ source: "mongodb_fallback", query, courses: courses.map((course) => normalizeCourse(course, lang)) });
  } catch (error) {
    res.status(500).json({ message: error.message || "Search failed" });
  }
};

export const getStudentCourseDetails = async (req, res) => {
  try {
    const lang = langFromRequest(req);
    const course = await findPublishedCourse(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId: course._id });
    const locked = course.isPaid && !enrollment;
    const detail = normalizeCourseDetail(course, lang, enrollment);
    if (locked) {
      detail.modules = detail.modules.map((module) => ({
        ...module,
        submodules: module.submodules.map((submodule) => ({
          ...submodule,
          contentBlocks: submodule.contentBlocks.map((block) =>
            block.isPreview
              ? block
              : { ...block, textContent: "", videoUrl: "", locked: true }
          ),
        })),
      }));
    }
    await logActivity({
      userId: req.user._id,
      activityType: "COURSE_CLICK",
      courseId: course._id,
      metadata: { language: lang, page: "course_detail" },
    });
    res.json({ course: detail, isLocked: locked });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch course" });
  }
};

const updateCourseEnrollmentMetric = async (courseId) => {
  const total = await Enrollment.countDocuments({
    courseId,
    accessStatus: "ACTIVE",
    status: { $in: ["ENROLLED", "COMPLETED"] },
  });
  await Course.findByIdAndUpdate(courseId, { "metrics.totalEnrollments": total });
};

const createEnrollment = async ({ userId, courseId, paymentId = null }) => {
  const existing = await Enrollment.findOne({ userId, courseId });
  if (existing) return existing;
  const enrollment = await Enrollment.create({
    userId,
    courseId,
    paymentId,
    accessStatus: "ACTIVE",
    status: "ENROLLED",
    progressPercentage: 0,
  });
  await Promise.all([
    updateCourseEnrollmentMetric(courseId),
    User.findByIdAndUpdate(userId, { $inc: { "stats.totalCoursesEnrolled": 1 } }),
    logActivity({
      userId,
      activityType: "ENROLL",
      courseId,
      metadata: { page: "course_detail" },
    }),
    createNotification({
      userId,
      type: "COURSE",
      relatedCourseId: courseId,
      relatedEnrollmentId: enrollment._id,
      title: { en: "Enrollment active" },
      message: { en: "Your lifetime course access is active." },
    }),
  ]);
  return enrollment;
};

export const enrollFreeCourse = async (req, res) => {
  try {
    const course = await findPublishedCourse(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.isPaid || course.price > 0) {
      return res.status(400).json({ message: "This course requires payment" });
    }
    const enrollment = await createEnrollment({ userId: req.user._id, courseId: course._id });
    res.status(201).json({ message: "Enrollment active", enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message || "Enrollment failed" });
  }
};

export const createPaymentOrder = async (req, res) => {
  try {
    const course = await findPublishedCourse(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!course.isPaid) return res.status(400).json({ message: "This course is free" });
    const existing = await findActiveEnrollment(req.user._id, course._id);
    if (existing) return res.status(409).json({ message: "Already enrolled", enrollment: existing });

    const amount = Math.round(course.price * 100);
    let order = null;
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `course_${course._id}_${Date.now()}`,
        }),
      });
      if (!response.ok) {
        return res.status(502).json({ message: "Razorpay order creation failed" });
      }
      order = await response.json();
    } else {
      order = { id: `order_dev_${Date.now()}`, amount, currency: "INR", devMode: true };
    }

    const payment = await Payment.create({
      userId: req.user._id,
      courseId: course._id,
      amount: course.price,
      currency: "INR",
      provider: "RAZORPAY",
      razorpayOrderId: order.id,
      status: "CREATED",
    });
    res.status(201).json({ order, payment, keyId: process.env.RAZORPAY_KEY_ID || "" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Payment order failed" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentMethod = "UNKNOWN" } = req.body;
    const payment = await Payment.findOne({
      userId: req.user._id,
      courseId: req.params.courseId,
      razorpayOrderId: razorpay_order_id,
      status: "CREATED",
    });
    if (!payment) return res.status(404).json({ message: "Payment order not found" });

    const devOrder = String(razorpay_order_id || "").startsWith("order_dev_");
    const valid = process.env.RAZORPAY_KEY_SECRET
      ? crypto
          .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest("hex") === razorpay_signature
      : devOrder;
    if (!valid) {
      payment.status = "FAILED";
      payment.failureReason = "Invalid Razorpay signature";
      await payment.save();
      return res.status(400).json({ message: "Payment verification failed" });
    }

    payment.status = "SUCCESS";
    payment.razorpayPaymentId = razorpay_payment_id || "";
    payment.razorpaySignature = razorpay_signature || "";
    payment.paymentMethod = paymentMethod;
    payment.paidAt = new Date();
    await payment.save();

    const enrollment = await createEnrollment({
      userId: req.user._id,
      courseId: payment.courseId,
      paymentId: payment._id,
    });
    res.json({ message: "Payment verified", payment, enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message || "Payment verification failed" });
  }
};

export const getCoursePlayer = async (req, res) => {
  try {
    const course = await findPublishedCourse(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const enrollment = await findActiveEnrollment(req.user._id, course._id);
    if (!enrollment) return res.status(403).json({ message: "Enrollment required" });
    res.json({ course: normalizeCourseDetail(course, langFromRequest(req), enrollment), enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to load player" });
  }
};

export const completeContentBlock = async (req, res) => {
  try {
    const { moduleId, submoduleId, blockId, blockType, timeSpentSeconds = 0 } = req.body;
    const course = await findPublishedCourse(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const enrollment = await findActiveEnrollment(req.user._id, course._id);
    if (!enrollment) return res.status(403).json({ message: "Enrollment required" });

    const exists = enrollment.completedBlocks.some((item) => String(item.blockId) === String(blockId));
    if (!exists) {
      enrollment.completedBlocks.push({
        moduleId: toObjectId(moduleId),
        submoduleId: toObjectId(submoduleId),
        blockId: toObjectId(blockId),
        blockType,
        completedAt: new Date(),
      });
    }
    enrollment.lastAccessed = {
      moduleId: toObjectId(moduleId),
      submoduleId: toObjectId(submoduleId),
      blockId: toObjectId(blockId),
    };
    enrollment.totalTimeSpentMinutes += Math.ceil(Number(timeSpentSeconds || 0) / 60);

    const wasCompleted = enrollment.status === "COMPLETED";
    enrollment.progressPercentage = calculateProgress(course, enrollment.completedBlocks);
    if (enrollment.progressPercentage >= 100) {
      enrollment.status = "COMPLETED";
      enrollment.completedAt ||= new Date();
      enrollment.completionStatus.allRequiredBlocksCompleted = true;
      enrollment.completionStatus.completedAt ||= enrollment.completedAt;
    }
    await enrollment.save();

    await Promise.all([
      User.findByIdAndUpdate(req.user._id, {
        $inc: {
          "stats.totalTimeSpentMinutes": Math.ceil(Number(timeSpentSeconds || 0) / 60),
          ...(enrollment.status === "COMPLETED" && !wasCompleted
            ? { "stats.totalCoursesCompleted": 1 }
            : {}),
        },
      }),
      logActivity({
        userId: req.user._id,
        activityType:
          blockType === "VIDEO"
            ? "VIDEO_WATCH"
            : blockType === "QUIZ"
              ? "QUIZ_ATTEMPT"
              : "TEXT_READ",
        courseId: course._id,
        moduleId,
        submoduleId,
        blockId,
        metadata: {
          page: "course_player",
          timeSpentSeconds,
          watchedPercentage: blockType === "VIDEO" ? 100 : 0,
        },
      }),
      enrollment.status === "COMPLETED" && !wasCompleted
        ? Promise.all([
            logActivity({
              userId: req.user._id,
              activityType: "COMPLETE",
              courseId: course._id,
              metadata: { page: "course_player" },
            }),
            createNotification({
              userId: req.user._id,
              type: "CERTIFICATE",
              relatedCourseId: course._id,
              relatedEnrollmentId: enrollment._id,
              title: { en: "Course completed" },
              message: { en: "Certificate generation will be available soon." },
            }),
            queueCertificateGeneration({ userId: req.user._id, courseId: course._id, enrollmentId: enrollment._id }),
          ])
        : Promise.resolve(),
    ]);

    res.json({ message: "Progress updated", enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message || "Progress update failed" });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { courseId, moduleId, submoduleId, blockId, answers } = req.body;
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    let score = 0;
    quiz.questions.forEach((q) => {
      if (String(answers[q.questionId]) === String(q.correctOptionId)) {
        score += q.marks;
      }
    });

    const percentage = Math.round((score / quiz.totalMarks) * 100);
    const passed = percentage >= (quiz.passingMarks / quiz.totalMarks) * 100;

    const enrollment = await findActiveEnrollment(req.user._id, courseId);
    if (!enrollment) return res.status(403).json({ message: "Enrollment required" });

    const result = {
      quizId,
      score,
      totalMarks: quiz.totalMarks,
      percentage,
      status: passed ? "PASSED" : "FAILED",
      attemptedAt: new Date(),
    };

    enrollment.quizResults.push(result);

    if (passed) {
      const exists = enrollment.completedBlocks.some(
        (item) => String(item.blockId) === String(blockId)
      );
      if (!exists) {
        enrollment.completedBlocks.push({
          moduleId: toObjectId(moduleId),
          submoduleId: toObjectId(submoduleId),
          blockId: toObjectId(blockId),
          blockType: "QUIZ",
          completedAt: new Date(),
        });
      }
      const course = await Course.findById(courseId);
      enrollment.progressPercentage = calculateProgress(course, enrollment.completedBlocks);
      if (enrollment.progressPercentage >= 100) {
        enrollment.status = "COMPLETED";
        enrollment.completedAt ||= new Date();
      }
    }

    await enrollment.save();
    res.json({ message: passed ? "Quiz passed!" : "Quiz failed.", result });
  } catch (error) {
    res.status(500).json({ message: error.message || "Quiz submission failed" });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const { courseId, quizId } = req.params;
    const enrollment = await findActiveEnrollment(req.user._id, courseId);
    if (!enrollment) return res.status(403).json({ message: "Enrollment required" });

    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Sanitize quiz: remove correctOptionId and hidden explanations
    const sanitized = {
      _id: quiz._id,
      title: quiz.title,
      totalMarks: quiz.totalMarks,
      passingMarks: quiz.passingMarks,
      timeLimitMinutes: quiz.timeLimitMinutes,
      questions: (quiz.questions || []).map((q) => ({
        questionId: q.questionId,
        questionText: q.questionText,
        marks: q.marks,
        options: (q.options || []).map((opt) => ({
          optionId: opt.optionId,
          text: opt.text,
        })),
      })),
    };

    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch quiz" });
  }
};

export const updateLastAccessed = async (req, res) => {
  try {
    const enrollment = await findActiveEnrollment(req.user._id, req.params.courseId);
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
    enrollment.lastAccessed = {
      moduleId: isObjectId(req.body.moduleId) ? toObjectId(req.body.moduleId) : undefined,
      submoduleId: isObjectId(req.body.submoduleId) ? toObjectId(req.body.submoduleId) : undefined,
      blockId: isObjectId(req.body.blockId) ? toObjectId(req.body.blockId) : undefined,
    };
    enrollment.totalTimeSpentMinutes += Math.ceil(Number(req.body.timeSpentSeconds || 0) / 60);
    await enrollment.save();
    res.json({ enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message || "Last accessed update failed" });
  }
};

export const createStudentActivity = async (req, res) => {
  try {
    const activity = await logActivity({
      userId: req.user._id,
      activityType: req.body.activityType,
      courseId: req.body.courseId,
      moduleId: req.body.moduleId,
      submoduleId: req.body.submoduleId,
      blockId: req.body.blockId,
      searchQuery: req.body.searchQuery,
      metadata: req.body.metadata || {},
    });
    res.status(201).json({ activity });
  } catch (error) {
    res.status(500).json({ message: error.message || "Activity logging failed" });
  }
};

export const getCourseRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ courseId: req.params.courseId })
      .populate("userId", "name profileImageUrl")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ ratings });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch ratings" });
  }
};

export const rateCourse = async (req, res) => {
  try {
    const enrollment = await findActiveEnrollment(req.user._id, req.params.courseId);
    if (!enrollment) return res.status(403).json({ message: "Only enrolled students can rate courses" });
    const ratingValue = Number(req.body.rating);
    if (ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    const language = LANGS.includes(req.body.language) ? req.body.language : "en";
    const review =
      typeof req.body.review === "string"
        ? { [language]: req.body.review }
        : req.body.review || {};
    const rating = await Rating.findOneAndUpdate(
      { userId: req.user._id, courseId: req.params.courseId },
      { rating: ratingValue, review },
      { upsert: true, new: true, runValidators: true }
    );
    const [metrics] = await Rating.aggregate([
      { $match: { courseId: toObjectId(req.params.courseId) } },
      { $group: { _id: "$courseId", average: { $avg: "$rating" }, total: { $sum: 1 } } },
    ]);
    await Course.findByIdAndUpdate(req.params.courseId, {
      "metrics.averageRating": Number((metrics?.average || ratingValue).toFixed(2)),
      "metrics.totalRatings": metrics?.total || 1,
    });
    await logActivity({
      userId: req.user._id,
      activityType: "RATING",
      courseId: req.params.courseId,
      metadata: { language, page: "course_detail" },
    });
    res.json({ rating });
  } catch (error) {
    res.status(500).json({ message: error.message || "Rating failed" });
  }
};

export const createRecommendationFeedback = async (req, res) => {
  try {
    const feedback = await RecommendationFeedback.create({
      userId: req.user._id,
      courseId: req.body.courseId,
      recommendationType: req.body.recommendationType,
      feedback: req.body.feedback,
      reason: req.body.reason || "Other",
    });
    res.status(201).json({ feedback });
  } catch (error) {
    res.status(500).json({ message: error.message || "Feedback failed" });
  }
};

export const getDashboardRecommendations = async (req, res) => {
  try {
    if (String(req.params.userId) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized for this user" });
    }
    const enrolled = await Enrollment.find({ userId: req.params.userId }).select("courseId");
    const courses = await Course.find({
      ...publishedFilter,
      _id: { $nin: enrolled.map((item) => item.courseId) },
    })
      .populate(coursePopulate)
      .sort({
        "metrics.feedbackScore": -1,
        "metrics.popularityScore": -1,
        "metrics.averageRating": -1,
        createdAt: -1,
      })
      .limit(12);
    res.json({
      source: "mongodb_fallback",
      recommendations: courses.map((course) => normalizeCourse(course, langFromRequest(req))),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Recommendations failed" });
  }
};

export const searchRecommendations = searchStudentCourses;
