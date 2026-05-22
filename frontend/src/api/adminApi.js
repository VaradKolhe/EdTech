import api from "./axios";

export const getPlatformStats = () => api.get("/admin/stats");
export const getReports = () => api.get("/admin/reports");

export const getTeachers = (params) => api.get("/admin/teachers", { params });
export const updateTeacherVerification = (id, status) =>
  api.patch(`/admin/teachers/${id}/verification`, { status });
export const deleteTeacher = (id) => api.delete(`/admin/teachers/${id}`);

export const getStudents = (params) => api.get("/admin/students", { params });
export const deleteStudent = (id) => api.delete(`/admin/students/${id}`);

export const getCourses = (params) => api.get("/admin/courses", { params });
export const deleteCourse = (id) => api.delete(`/admin/courses/${id}`);

export const getFeedbackAnalytics = () => api.get("/admin/feedback/analytics");

export const getCertificates = () => api.get("/admin/certificates");
export const uploadCertificate = (formData) =>
  api.post("/admin/certificates/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteCertificate = (id) => api.delete(`/admin/certificates/${id}`);

export const moderateUser = (id, role) =>
  api.delete(`/admin/moderation/users/${id}`, { params: { role } });
export const moderateCourse = (id) =>
  api.delete(`/admin/moderation/courses/${id}`);

export const moderateRemoveUser = moderateUser;
export const moderateRemoveCourse = moderateCourse;
