import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  completeContentBlock,
  createPaymentOrder,
  createStudentActivity,
  enrollFreeCourse,
  getOnboardingStatus,
  getCoursePlayer,
  getCourseRatings,
  getStudentCourseDetails,
  getStudentCourses,
  getStudentDashboardData,
  getStudentEnrollmentById,
  getStudentEnrollments,
  getStudentProfile,
  rateCourse,
  updateStudentProfile,
  searchStudentCourses,
  submitQuiz,
  getQuiz,
  updateLastAccessed,
  verifyPayment,
} from "../controllers/studentController.js";
import {
  listNotifications,
  markNotificationRead,
} from "../services/notificationService.js";

const router = express.Router();

router.use(protect);

router.get("/profile", authorizeRoles("student"), getStudentProfile);
router.patch("/profile", authorizeRoles("student"), updateStudentProfile);
router.get("/onboarding/status", authorizeRoles("student"), getOnboardingStatus);
router.get("/dashboard", authorizeRoles("student"), getStudentDashboardData);

router.get("/enrollments", authorizeRoles("student"), getStudentEnrollments);
router.get("/enrollments/:id", authorizeRoles("student"), getStudentEnrollmentById);

router.get("/courses/search", authorizeRoles("student"), searchStudentCourses);
router.get("/courses", authorizeRoles("student"), getStudentCourses);
router.get("/courses/:courseId", authorizeRoles("student", "admin", "instructor"), getStudentCourseDetails);

router.post("/courses/:courseId/enroll/free", authorizeRoles("student"), enrollFreeCourse);
router.post("/courses/:courseId/payment/create-order", authorizeRoles("student"), createPaymentOrder);
router.post("/courses/:courseId/payment/verify", authorizeRoles("student"), verifyPayment);

router.get("/courses/:courseId/player", authorizeRoles("student", "admin", "instructor"), getCoursePlayer);
router.post("/courses/:courseId/quizzes/:quizId/submit", authorizeRoles("student", "admin", "instructor"), submitQuiz);
router.get("/courses/:courseId/quizzes/:quizId", authorizeRoles("student", "admin", "instructor"), getQuiz);
router.post("/courses/:courseId/progress/block-complete", authorizeRoles("student", "admin", "instructor"), completeContentBlock);
router.post("/courses/:courseId/progress/last-accessed", authorizeRoles("student", "admin", "instructor"), updateLastAccessed);

router.post("/courses/:courseId/rating", authorizeRoles("student"), rateCourse);
router.get("/courses/:courseId/ratings", authorizeRoles("student", "admin", "instructor"), getCourseRatings);

router.post("/activity", authorizeRoles("student"), createStudentActivity);

router.get("/notifications", authorizeRoles("student"), listNotifications);
router.patch("/notifications/:id/read", authorizeRoles("student"), markNotificationRead);

export default router;
