import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Category from "../models/Category.js";
import CertificateTemplate from "../models/CertificateTemplate.js";
import Metadata from "../models/Metadata.js";
import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import Enrollment from "../models/Enrollment.js";
import Rating from "../models/Rating.js";
import UserActivity from "../models/UserActivity.js";
import RecommendationFeedback from "../models/RecommendationFeedback.js";
import Notification from "../models/Notification.js";

dotenv.config();

const password = "Password123!";

const t = (en, hi = "", mr = "") => ({ en, hi, mr });
const oid = () => new mongoose.Types.ObjectId();

const makeBlock = ({ order, type, title, text = "", videoUrl = "", quizId, isPreview = false }) => ({
  blockId: oid(),
  order,
  type,
  title: t(title),
  textContent: t(text),
  videoUrl,
  videoFileName: "",
  durationMinutes: type === "VIDEO" ? 8 + order : 0,
  isPreview,
  quizId,
  isRequiredForCompletion: true,
});

const makeFullModules = (courseTitle, quizId) => {
  const moduleId = oid();
  const submoduleId = oid();
  return {
    modules: [
      {
        moduleId,
        order: 1,
        moduleTitle: t(`${courseTitle} Foundations`),
        moduleDescription: t("Core concepts and setup."),
        submodules: [
          {
            submoduleId,
            order: 1,
            submoduleTitle: t("Getting started"),
            submoduleDescription: t("Understand the topic and complete the first activity."),
            contentBlocks: [
              makeBlock({
                order: 1,
                type: "TEXT",
                title: "Overview",
                text: `<p>Welcome to ${courseTitle}. This lesson introduces the core ideas.</p>`,
                isPreview: true,
              }),
              makeBlock({
                order: 2,
                type: "VIDEO",
                title: "Intro video",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                isPreview: true,
              }),
              makeBlock({ order: 3, type: "QUIZ", title: "Knowledge check", quizId }),
            ],
          },
        ],
      },
    ],
    moduleId,
    submoduleId,
  };
};

const usersData = [
  ["Asha Admin", "admin1@edtech.local", "admin"],
  ["Ravi Admin", "admin2@edtech.local", "admin"],
  ["Isha Instructor", "instructor1@edtech.local", "instructor"],
  ["Kabir Instructor", "instructor2@edtech.local", "instructor"],
  ["Meera Instructor", "instructor3@edtech.local", "instructor"],
  ["Neha Student", "student1@edtech.local", "student"],
  ["Arjun Student", "student2@edtech.local", "student"],
  ["Sara Student", "student3@edtech.local", "student"],
  ["Dev Student", "student4@edtech.local", "student"],
  ["Priya Student", "student5@edtech.local", "student"],
];

export const seedDatabase = async () => {
  if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI");
  await mongoose.connect(process.env.MONGO_URI);

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    CertificateTemplate.deleteMany({}),
    Metadata.deleteMany({}),
    Course.deleteMany({}),
    Quiz.deleteMany({}),
    Enrollment.deleteMany({}),
    Rating.deleteMany({}),
    UserActivity.deleteMany({}),
    RecommendationFeedback.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const users = await User.create(
    usersData.map(([name, email, role]) => ({
      name,
      email,
      password,
      role,
      profile:
        role === "student"
          ? {
              ageGroup: "18-24",
              educationLevel: "Undergraduate",
              preferredStreams: ["Programming", "Data Science"],
              skillLevel: "Beginner",
              careerGoal: "Get a job",
              budgetPreference: "Both",
              preferredDifficulty: "Beginner",
              preferredLanguage: "en",
            }
          : {},
      instructorProfile:
      role === "instructor"
      ? {
      bio: t(`${name} teaches practical technology courses.`),
      expertise: ["Programming", "Cloud", "Data Science"],
      verification: { status: "NOT_APPLIED" },
      rating: 4.6,
      totalCourses: 0,
      }
      : undefined,    }))
  );

  const admins = users.filter((u) => u.role === "admin");
  const instructors = users.filter((u) => u.role === "instructor");
  const students = users.filter((u) => u.role === "student");

  const categories = await Category.insertMany(
    [
      "Programming",
      "Data Science",
      "Networking",
      "Cybersecurity",
      "Cloud Computing",
      "Business Skills",
    ].map((name) => ({
      name: t(name),
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      description: t(`${name} courses`),
      isActive: true,
    }))
  );

  await Metadata.create({
    type: "onboarding-options",
    data: {
      ageGroup: ["13-17", "18-24", "25-34", "35+"],
      educationLevel: ["School", "Diploma", "Undergraduate", "Postgraduate", "Working Professional"],
      skillLevel: ["Beginner", "Intermediate", "Advanced"],
      careerGoal: ["Get a job", "Switch career", "Improve current skills", "Prepare for exams", "Build projects"],
      budgetPreference: ["Free", "Paid", "Both"],
      preferredDifficulty: ["Beginner", "Intermediate", "Advanced"],
      preferredLanguage: ["en", "hi", "mr"],
      preferredStreams: ["Programming", "Data Science", "Networking", "Cybersecurity", "Cloud", "Design", "Business"],
    },
  });

  const template = await CertificateTemplate.create({
    uploadedByAdminId: admins[0]._id,
    templateName: "Default Universal Template",
    templateUrl: "/uploads/certificates/default-template.pdf",
    templateType: "PDF",
    placeholders: ["studentName", "courseTitle", "completionDate", "certificateId", "instructorName"],
    isDefault: true,
    isActive: true,
  });

  const quizIds = [oid(), oid(), oid()];
  const courseSpecs = [
    ["Python Foundations", "Programming", "Beginner", 0, instructors[0]],
    ["React Application Builder", "Programming", "Intermediate", 1499, instructors[0]],
    ["Data Science with Python", "Data Science", "Beginner", 1999, instructors[1]],
    ["Networking Essentials", "Networking", "Beginner", 0, instructors[1]],
    ["Cybersecurity Basics", "Cybersecurity", "Beginner", 999, instructors[2]],
    ["AWS Cloud Starter", "Cloud Computing", "Beginner", 1299, instructors[2]],
    ["Advanced React Patterns", "Programming", "Advanced", 2499, instructors[0]],
    ["Machine Learning Intro", "Data Science", "Intermediate", 2999, instructors[1]],
    ["Secure Web Apps", "Cybersecurity", "Intermediate", 1799, instructors[2]],
    ["Productivity for Professionals", "Business Skills", "Beginner", 0, instructors[0]],
    ["Draft Kubernetes Deep Dive", "Cloud Computing", "Advanced", 3499, instructors[2], "DRAFT"],
    ["Draft Business Analytics", "Business Skills", "Intermediate", 1599, instructors[1], "DRAFT"],
  ];

  const courses = [];
  for (let i = 0; i < courseSpecs.length; i += 1) {
    const [title, categoryName, difficulty, price, instructor, status = "PUBLISHED"] = courseSpecs[i];
    const category = categories.find((c) => c.name.en === categoryName);
    const quizId = quizIds[i] || undefined;
    const full = i < 3 ? makeFullModules(title, quizId) : { modules: [] };
    courses.push(
      await Course.create({
        title: t(title, `${title} Hindi`, `${title} Marathi`),
        description: t(`${title} is a practical, project-focused course.`),
        shortDescription: t(`Learn ${title} with structured lessons.`),
        languageAvailable: i % 3 === 0 ? ["en", "hi", "mr"] : ["en"],
        categoryId: category._id,
        tags: { en: [categoryName, difficulty], hi: [], mr: [] },
        difficulty,
        price,
        currency: "INR",
        isPaid: price > 0,
        instructorId: instructor._id,
        thumbnailUrl: "",
        certificateTemplateId: template._id,
        completionRules: {
          requireAllContentBlocksCompleted: true,
          requireAllQuizzesPassed: false,
          minimumQuizPassingPercentage: 50,
        },
        modules: full.modules,
        recommendationFeatures: {
          stream: categoryName,
          skillLevel: difficulty,
          targetAgeGroups: ["18-24", "25-34"],
          targetEducationLevels: ["Undergraduate", "Working Professional"],
          careerGoals: ["Get a job", "Improve current skills"],
          keywords: [title, categoryName, difficulty],
        },
        translationStatus: { hi: "COMPLETED", mr: "COMPLETED" },
        metrics: {
          averageRating: 0,
          totalRatings: 0,
          totalEnrollments: 0,
          completionRate: 0,
          popularityScore: 50 + i,
          feedbackScore: 0,
        },
        status,
      })
    );
  }

  for (let i = 0; i < 3; i += 1) {
    const course = courses[i];
    const moduleId = course.modules[0].moduleId;
    const submoduleId = course.modules[0].submodules[0].submoduleId;
    const optionId = oid();
    await Quiz.create({
      _id: quizIds[i],
      courseId: course._id,
      moduleId,
      submoduleId,
      title: t(`${course.title.en} Quiz`),
      questions: [
        {
          questionId: oid(),
          questionText: t("What is the main purpose of this lesson?"),
          options: [
            { optionId, text: t("Understand the foundation") },
            { optionId: oid(), text: t("Skip the basics") },
          ],
          correctOptionId: optionId,
          marks: 1,
        },
      ],
      totalMarks: 1,
      passingMarks: 1,
      timeLimitMinutes: 5,
    });
  }

  const enrollmentPayloads = [
    { userId: students[0]._id, course: courses[0], completed: true },
    { userId: students[1]._id, course: courses[1], completed: false },
    { userId: students[2]._id, course: courses[2], completed: false },
  ];

  const enrollments = [];
  for (const item of enrollmentPayloads) {
    const blocks = flattenSeedBlocks(item.course);
    const completedBlocks = item.completed
      ? blocks.map((b) => ({ ...b, completedAt: new Date() }))
      : blocks.slice(0, 1).map((b) => ({ ...b, completedAt: new Date() }));
    enrollments.push(
      await Enrollment.create({
        userId: item.userId,
        courseId: item.course._id,
        accessStatus: "ACTIVE",
        status: item.completed ? "COMPLETED" : "ENROLLED",
        progressPercentage: item.completed ? 100 : 33,
        completedBlocks,
        completionStatus: {
          allRequiredBlocksCompleted: item.completed,
          allRequiredQuizzesPassed: true,
          completedAt: item.completed ? new Date() : undefined,
        },
        lastAccessed: completedBlocks.at(-1),
        totalTimeSpentMinutes: item.completed ? 45 : 12,
        completedAt: item.completed ? new Date() : undefined,
      })
    );
  }

  const ratingRows = [
    [students[0], courses[0], 5],
    [students[1], courses[0], 4],
    [students[2], courses[1], 5],
    [students[3], courses[2], 4],
    [students[4], courses[3], 5],
  ];
  await Rating.insertMany(
    ratingRows.map(([student, course, rating]) => ({
      userId: student._id,
      courseId: course._id,
      rating,
      review: t("Clear course content and useful structure."),
    }))
  );

  for (const course of courses.slice(0, 4)) {
    const ratings = await Rating.find({ courseId: course._id });
    if (ratings.length) {
      course.metrics.averageRating = Number((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(2));
      course.metrics.totalRatings = ratings.length;
    }
    course.metrics.totalEnrollments = enrollments.filter((e) => String(e.courseId) === String(course._id)).length;
    await course.save();
  }

  await UserActivity.insertMany([
    { userId: students[0]._id, activityType: "SEARCH", searchQuery: "python", metadata: { language: "en", page: "search" } },
    { userId: students[0]._id, activityType: "COURSE_CLICK", courseId: courses[0]._id, metadata: { language: "en", page: "course_detail" } },
    { userId: students[1]._id, activityType: "ENROLL", courseId: courses[1]._id, metadata: { language: "en", page: "course_detail" } },
    { userId: students[0]._id, activityType: "COMPLETE", courseId: courses[0]._id, metadata: { language: "en", page: "course_player" } },
  ]);

  await RecommendationFeedback.create({
    userId: students[0]._id,
    courseId: courses[1]._id,
    recommendationType: "DASHBOARD",
    feedback: "RELEVANT",
    reason: "Other",
  });

  await Notification.insertMany([
    {
      userId: students[0]._id,
      title: t("Welcome to EdTech"),
      message: t("Your seeded account is ready."),
      type: "ADMIN",
    },
    {
      userId: students[1]._id,
      title: t("Course enrollment active"),
      message: t("Your lifetime access is active."),
      type: "COURSE",
      relatedCourseId: courses[1]._id,
      relatedEnrollmentId: enrollments[1]._id,
    },
  ]);

  for (const instructor of instructors) {
    await User.findByIdAndUpdate(instructor._id, {
      "instructorProfile.totalCourses": courses.filter(
        (course) => String(course.instructorId) === String(instructor._id)
      ).length,
    });
  }

  console.log("\nSeed complete. Login credentials:");
  usersData.forEach(([name, email, role]) => {
    console.log(`${role.padEnd(10)} ${email.padEnd(30)} ${password}  (${name})`);
  });
};

const flattenSeedBlocks = (course) =>
  course.modules.flatMap((module) =>
    module.submodules.flatMap((submodule) =>
      submodule.contentBlocks.map((block) => ({
        moduleId: module.moduleId,
        submoduleId: submodule.submoduleId,
        blockId: block.blockId,
        blockType: block.type,
      }))
    )
  );

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  seedDatabase()
    .then(async () => {
      await mongoose.disconnect();
    })
    .catch(async (error) => {
      console.error(error);
      await mongoose.disconnect().catch(() => null);
      process.exit(1);
    });
}
