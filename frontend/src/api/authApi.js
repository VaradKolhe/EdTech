import api from "./axios";

export const registerStudent = (data) =>
  api.post("/auth/register/student", data);

export const registerTeacher = (data) =>
  api.post("/auth/register/teacher", data);

export const login = (data) => api.post("/auth/login", data);

export const getMe = () => api.get("/auth/me");
