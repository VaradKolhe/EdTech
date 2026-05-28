import api from "./axios";

export const getPlatformStats = () => api.get("/admin/stats");
export const getReports = () => api.get("/admin/reports");

export const getInstructors = (params) => api.get("/admin/instructors", { params });
export const updateInstructorVerification = (id, status, data = {}) =>
  api.patch(`/admin/instructors/${id}/verification`, { status, ...data });
export const deleteInstructor = (id) => api.delete(`/admin/instructors/${id}`);

export const getStudents = (params) => api.get("/admin/students", { params });
export const deleteStudent = (id) => api.delete(`/admin/students/${id}`);

export const getCourses = (params) => api.get("/admin/courses", { params });
export const getPendingCourses = () => api.get("/admin/courses/pending-review");
export const approveCourse = (id) => api.patch(`/admin/courses/${id}/approve`);
export const rejectCourse = (id, reason) => api.patch(`/admin/courses/${id}/reject`, { reason });
export const archiveCourse = (id, reason) => api.patch(`/admin/courses/${id}/archive`, { reason });
export const deleteCourse = (id) => api.delete(`/admin/courses/${id}`);

export const getFeedbackAnalytics = () => api.get("/admin/feedback/analytics");

export const getCertificates = () => api.get("/admin/certificates");
export const uploadCertificate = (formData) =>
  api.post("/admin/certificates/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const setDefaultCertificateTemplate = (id) =>
  api.patch(`/admin/certificates/${id}/default`);
export const updateCertificateTemplateStatus = (id, isActive) =>
  api.patch(`/admin/certificates/${id}/status`, { isActive });
export const deleteCertificate = (id) => api.delete(`/admin/certificates/${id}`);

export const getUserProfile = (id) => api.get(`/admin/users/${id}`);
