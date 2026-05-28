import api from "./axios";

export const getStudentProfile = () => api.get("/student/profile");

export const updateStudentProfile = (data) => api.patch("/student/profile", data);

export const getOnboardingStatus = () => api.get("/student/onboarding/status");
export const getStudentDashboard = (params) => api.get("/student/dashboard", { params });

export const getStudentEnrollments = (params) =>
  api.get("/student/enrollments", { params });
export const getStudentEnrollment = (id) => api.get(`/student/enrollments/${id}`);

export const getStudentCourses = (params) => api.get("/student/courses", { params });
export const searchStudentCourses = (params) =>
  api.get("/student/courses/search", { params });
export const getStudentCourse = (courseId, params) =>
  api.get(`/student/courses/${courseId}`, { params });

export const enrollFreeCourse = (courseId) =>
  api.post(`/student/courses/${courseId}/enroll/free`);
export const createPaymentOrder = (courseId) =>
  api.post(`/student/courses/${courseId}/payment/create-order`);
export const verifyPayment = (courseId, data) =>
  api.post(`/student/courses/${courseId}/payment/verify`, data);

export const getCoursePlayer = (courseId, params) =>
  api.get(`/student/courses/${courseId}/player`, { params });
export const completeContentBlock = (courseId, data) =>
  api.post(`/student/courses/${courseId}/progress/block-complete`, data);
export const updateLastAccessed = (courseId, data) =>
  api.post(`/student/courses/${courseId}/progress/last-accessed`, data);

export const rateCourse = (courseId, data) =>
  api.post(`/student/courses/${courseId}/rating`, data);
export const getCourseRatings = (courseId) =>
  api.get(`/student/courses/${courseId}/ratings`);

export const logStudentActivity = (data) => api.post("/student/activity", data);

export const getDashboardRecommendations = (userId, params) =>
  api.get(`/recommendations/dashboard/${userId}`, { params });
export const searchRecommendations = (params) =>
  api.get("/recommendations/search", { params });
export const getSimilarCourses = (courseId, params) =>
  api.get(`/recommendations/similar/${courseId}`, { params });
export const submitRecommendationFeedback = (data) =>
  api.post("/recommendations/feedback", data);
