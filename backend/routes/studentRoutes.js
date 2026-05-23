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

router.use(protect, authorizeRoles("student"));

router.get("/profile", getStudentProfile);
router.patch("/profile", updateStudentProfile);
router.get("/onboarding/status", getOnboardingStatus);
router.get("/dashboard", getStudentDashboardData);

router.get("/enrollments", getStudentEnrollments);
router.get("/enrollments/:id", getStudentEnrollmentById);

router.get("/courses/search", searchStudentCourses);
router.get("/courses", getStudentCourses);
router.get("/courses/:courseId", getStudentCourseDetails);

router.post("/courses/:courseId/enroll/free", enrollFreeCourse);
router.post("/courses/:courseId/payment/create-order", createPaymentOrder);
router.post("/courses/:courseId/payment/verify", verifyPayment);

router.get("/courses/:courseId/player", getCoursePlayer);
router.post("/courses/:courseId/quizzes/:quizId/submit", submitQuiz);
router.get("/courses/:courseId/quizzes/:quizId", getQuiz);
router.post("/courses/:courseId/progress/block-complete", completeContentBlock);
router.post("/courses/:courseId/progress/last-accessed", updateLastAccessed);

router.post("/courses/:courseId/rating", rateCourse);
router.get("/courses/:courseId/ratings", getCourseRatings);

router.post("/activity", createStudentActivity);

router.get("/notifications", listNotifications);
router.patch("/notifications/:id/read", markNotificationRead);

export default router;
