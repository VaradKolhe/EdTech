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
import Payment from "../models/Payment.js";

dotenv.config();
console.log("Starting dbSeed.js...");

const password = "Password123!";

const t = (en, hi = "", mr = "") => ({ en, hi, mr });
const oid = () => new mongoose.Types.ObjectId();

const makeBlock = ({ order, type, title, text = "", videoUrl = "", quizId, isPreview = false }) => {
  let titleHi = "अध्याय";
  let titleMr = "धडा";
  if (title === "Overview") {
    titleHi = "अवलोकन";
    titleMr = "आढावा";
  } else if (title === "Intro video") {
    titleHi = "परिचय वीडियो";
    titleMr = "परिचय व्हिडिओ";
  } else if (title === "Knowledge check") {
    titleHi = "ज्ञान की जांच";
    titleMr = "ज्ञान चाचणी";
  }

  const block = {
    blockId: oid(),
    order,
    type,
    title: t(title, titleHi, titleMr),
    textContent: t(
      text,
      text.replace("Welcome to", "स्वागत है").replace("This lesson introduces the core ideas.", "यह पाठ मुख्य विचारों का परिचय देता है।"),
      text.replace("Welcome to", "स्वागत आहे").replace("This lesson introduces the core ideas.", "हा धडा मुख्य कल्पनांची ओळख करून देतो.")
    ),
    durationMinutes: type === "VIDEO" ? 8 + order : 0,
    isPreview,
    quizId,
    isRequiredForCompletion: true,
  };
  if (type === "VIDEO" && videoUrl) {
    block.video = {
      type: "external",
      url: videoUrl,
      provider: videoUrl.includes("youtube") ? "youtube" : "direct",
    };
  }
  return block;
};

const makeFullModules = (courseTitle, quizId) => {
  const moduleId = oid();
  const submoduleId = oid();
  return {
    modules: [
      {
        moduleId,
        order: 1,
        moduleTitle: t(`${courseTitle} Foundations`, `${courseTitle} की नींव`, `${courseTitle} चा पाया`),
        moduleDescription: t("Core concepts and setup.", "मुख्य अवधारणाएं और सेटअप।", "मुख्य संकल्पना आणि सेटअप."),
        submodules: [
          {
            submoduleId,
            order: 1,
            submoduleTitle: t("Getting started", "शुरू करना", "सुरुवात करणे"),
            submoduleDescription: t("Understand the topic and complete the first activity.", "विषय को समझें और पहली गतिविधि पूरी करें।", "विषय समजून घ्या आणि पहिली क्रिया पूर्ण करा."),
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
  ["Isha Instructor", "instructor1@edtech.local", "instructor", "APPROVED"],
  ["Kabir Instructor", "instructor2@edtech.local", "instructor", "APPROVED"],
  ["Meera Instructor", "instructor3@edtech.local", "instructor", "PENDING"],
  ["Neha Student", "student1@edtech.local", "student"],
  ["Arjun Student", "student2@edtech.local", "student"],
  ["Sara Student", "student3@edtech.local", "student"],
  ["Dev Student", "student4@edtech.local", "student"],
  ["Priya Student", "student5@edtech.local", "student"],
];

export const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("Missing MONGO_URI");

  const options = {};
  if (!mongoUri.includes("/edtech")) {
    options.dbName = "edtech";
  }
  
  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri, options);
  console.log("Connected to MongoDB. Clearing existing data...");

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
    Payment.deleteMany({}),
  ]);

  const users = await User.create(
    usersData.map(([name, email, role, verificationStatus]) => ({
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
      bio: t(
        `${name} teaches practical technology courses.`,
        `${name} व्यावहारिक तकनीकी पाठ्यक्रम पढ़ाते हैं।`,
        `${name} व्यावहारिक तांत्रिक अभ्यासक्रम शिकवतात.`
      ),
      expertise: ["Programming", "Cloud", "Data Science"],
      verification: { 
        status: verificationStatus || "NOT_APPLIED",
        submittedAt: verificationStatus === "APPROVED" ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : undefined
      },
      rating: 4.6,
      totalCourses: 0,
      }
      : undefined,    }))
  );

  const admins = users.filter((u) => u.role === "admin");
  const instructors = users.filter((u) => u.role === "instructor");
  const students = users.filter((u) => u.role === "student");

  const categoryTranslations = {
    "Programming": ["प्रोग्रामिंग", "प्रोग्रामिंग"],
    "Data Science": ["डेटा साइंस", "डेटा सायन्स"],
    "Networking": ["नेटवर्किंग", "नेटवर्किंग"],
    "Cybersecurity": ["साइबर सुरक्षा", "सायबर सुरक्षा"],
    "Cloud Computing": ["क्लाउड कंप्यूटिंग", "क्लाउड कॉम्प्युटिंग"],
    "Business Skills": ["व्यावसायिक कौशल", "व्यावसायिक कौशल्ये"]
  };

  const categories = await Category.insertMany(
    [
      "Programming",
      "Data Science",
      "Networking",
      "Cybersecurity",
      "Cloud Computing",
      "Business Skills",
    ].map((name) => ({
      name: t(name, categoryTranslations[name][0], categoryTranslations[name][1]),
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      description: t(
        `${name} courses`,
        `${categoryTranslations[name][0]} पाठ्यक्रम`,
        `${categoryTranslations[name][1]} अभ्यासक्रम`
      ),
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
    ["Python Foundations", "Programming", "Beginner", 0, instructors[0], "PUBLISHED"],
    ["React Application Builder", "Programming", "Intermediate", 1499, instructors[0], "PUBLISHED"],
    ["Data Science with Python", "Data Science", "Beginner", 1999, instructors[1], "PUBLISHED"],
    ["Networking Essentials", "Networking", "Beginner", 0, instructors[1], "PENDING_REVIEW"],
    ["Cybersecurity Basics", "Cybersecurity", "Beginner", 999, instructors[0], "REJECTED"],
    ["AWS Cloud Starter", "Cloud Computing", "Beginner", 1299, instructors[0], "PAYMENT_PENDING"],
    ["Advanced React Patterns", "Programming", "Advanced", 2499, instructors[1], "PUBLISHED"],
    ["Machine Learning Intro", "Data Science", "Intermediate", 2999, instructors[1], "PUBLISHED"],
    ["Secure Web Apps", "Cybersecurity", "Intermediate", 1799, instructors[0], "DRAFT"],
    ["Productivity for Professionals", "Business Skills", "Beginner", 0, instructors[0], "PUBLISHED"],
    ["Draft Kubernetes Deep Dive", "Cloud Computing", "Advanced", 3499, instructors[1], "DRAFT"],
    ["Draft Business Analytics", "Business Skills", "Intermediate", 1599, instructors[1], "DRAFT"],
  ];

  const courseTranslations = {
    "Python Foundations": ["पायथन की बुनियादी बातें", "पायथनची पायाभरणी"],
    "React Application Builder": ["रिएक्ट एप्लीकेशन बिल्डर", "रिएक्ट ॲप्लिकेशन बिल्डर"],
    "Data Science with Python": ["पायथन के साथ डेटा साइंस", "पायथनसह डेटा सायन्स"],
    "Networking Essentials": ["नेटवर्किंग की अनिवार्यताएं", "नेटवर्किंगची आवश्यकता"],
    "Cybersecurity Basics": ["साइबर सुरक्षा मूल बातें", "सायबर सुरक्षा मूलभूत गोष्टी"],
    "AWS Cloud Starter": ["एडब्ल्यूएस क्लाउड स्टार्टर", "एडब्ल्यूएस क्लाउड स्टार्टर"],
    "Advanced React Patterns": ["उन्नत रिएक्ट पैटर्न", "प्रगत रिएक्ट नमुने"],
    "Machine Learning Intro": ["मशीन लर्निंग परिचय", "मशीन लर्निंग परिचय"],
    "Secure Web Apps": ["सुरक्षित वेब ऐप्स", "सुरक्षित वेब ॲप्स"],
    "Productivity for Professionals": ["पेशेवरों के लिए उत्पादकता", "व्यावसायिकांसाठी उत्पादकता"],
    "Draft Kubernetes Deep Dive": ["कुबेरनेट्स डीप डाइव", "कुबेरनेट्स डीप डाइव"],
    "Draft Business Analytics": ["बिजनेस एनालिटिक्स", "बिझनेस ॲनालिटिक्स"]
  };

  const courses = [];
  for (let i = 0; i < courseSpecs.length; i += 1) {
    const [title, categoryName, difficulty, price, instructor, status] = courseSpecs[i];
    const category = categories.find((c) => c.name.en === categoryName);
    const quizId = quizIds[i] || undefined;
    const full = i < 3 ? makeFullModules(title, quizId) : { modules: [] };

    const courseData = {
        title: t(title, courseTranslations[title][0], courseTranslations[title][1]),
        description: t(`${title} is a practical, project-focused course.`, `${title} एक व्यावहारिक, प्रोजेक्ट-केंद्रित कोर्स है।`, `${title} हा एक व्यावहारिक, प्रकल्प-केंद्रीत कोर्स आहे.`),
        shortDescription: t(`Learn ${title} with structured lessons.`, `संरचित पाठों के साथ ${title} सीखें।`, `संरचित धड्यांसह ${title} शिका.`),
        languageAvailable: ["en", "hi", "mr"],
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
      };

      // Add workflow dates
      if (status !== "DRAFT") {
        courseData.submittedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      }
      if (["PUBLISHED", "PAYMENT_PENDING", "REJECTED"].includes(status)) {
        courseData.reviewedAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        courseData.reviewedBy = admins[0]._id;
      }
      if (status === "REJECTED") {
        courseData.rejectionReason = "Course content is too brief. Please add more modules and interactive elements.";
      }
      if (status === "PUBLISHED") {
        courseData.publishedAt = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
        courseData.platformFeePaid = true;
      }

    courses.push(await Course.create(courseData));
  }

  // Create some publishing fee payments for published courses
  for (const course of courses.filter(c => c.status === "PUBLISHED")) {
    const payment = await Payment.create({
        userId: course.instructorId,
        courseId: course._id,
        amount: 499,
        currency: "INR",
        provider: "RAZORPAY",
        razorpayOrderId: `order_pub_${course._id.toString().slice(-6)}`,
        razorpayPaymentId: `pay_pub_${course._id.toString().slice(-6)}`,
        razorpaySignature: "seeded_signature",
        status: "SUCCESS",
        purpose: "COURSE_PUBLISHING_FEE",
        paidAt: course.publishedAt
    });
    course.platformFeePaymentId = payment._id;
    await course.save();
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
      title: t(`${course.title.en} Quiz`, `${course.title.en} प्रश्नोत्तरी`, `${course.title.en} प्रश्नमंजुषा`),
      questions: [
        {
          questionId: oid(),
          questionText: t("What is the main purpose of this lesson?", "इस पाठ का मुख्य उद्देश्य क्या है?", "या धड्याचा मुख्य उद्देश काय आहे?"),
          options: [
            { optionId, text: t("Understand the foundation", "बुनियाद को समझना", "पाया समजून घेणे") },
            { optionId: oid(), text: t("Skip the basics", "बुनियादी बातों को छोड़ना", "मूलभूत गोष्टी सोडणे") },
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
    // Create payment for the enrollment if course is paid
    let paymentId = undefined;
    if (item.course.isPaid) {
        const pay = await Payment.create({
            userId: item.userId,
            courseId: item.course._id,
            amount: item.course.price,
            currency: "INR",
            provider: "RAZORPAY",
            razorpayOrderId: `order_buy_${item.course._id.toString().slice(-6)}`,
            razorpayPaymentId: `pay_buy_${item.course._id.toString().slice(-6)}`,
            razorpaySignature: "seeded_signature",
            status: "SUCCESS",
            purpose: "COURSE_PURCHASE",
            paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        });
        paymentId = pay._id;
    }

    const blocks = flattenSeedBlocks(item.course);
    const completedBlocks = item.completed
      ? blocks.map((b) => ({ ...b, completedAt: new Date() }))
      : blocks.slice(0, 1).map((b) => ({ ...b, completedAt: new Date() }));
    enrollments.push(
      await Enrollment.create({
        userId: item.userId,
        courseId: item.course._id,
        paymentId,
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
      review: t(
        "Clear course content and useful structure.",
        "स्पष्ट पाठ्यक्रम सामग्री और उपयोगी संरचना।",
        "स्पष्ट अभ्यासक्रम सामग्री आणि उपयुक्त रचना."
      ),
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
      title: t("Welcome to EdTech", "EdTech में आपका स्वागत है", "EdTech मध्ये आपले स्वागत आहे"),
      message: t("Your seeded account is ready.", "आपका सीडेड अकाउंट तैयार है।", "तुमचे सीडेड अकाउंट तयार आहे."),
      type: "ADMIN",
    },
    {
      userId: students[1]._id,
      title: t("Course enrollment active", "कोर्स नामांकन सक्रिय", "कोर्स नोंदणी सक्रिय"),
      message: t("Your lifetime access is active.", "आपकी लाइफटाइम एक्सेस सक्रिय है।", "तुमची लाइफटाइम ॲक्सेस सक्रिय आहे."),
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

// Run the seed
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  seedDatabase()
    .then(async () => {
      console.log("Seeding finished successfully.");
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error("Seeding failed:", error);
      await mongoose.disconnect().catch(() => null);
      process.exit(1);
    });
}
