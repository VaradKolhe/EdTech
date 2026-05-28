import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const language = localStorage.getItem("appLanguage") || localStorage.getItem("language") || "en";
  config.params = {
    ...config.params,
    language: config.params?.language || language,
  };
  return config;
});

export default api;
