import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach current language
  const language = localStorage.getItem("appLanguage") || localStorage.getItem("language") || "en";
  config.params = {
    ...config.params,
    language: config.params?.language || language,
  };

  return config;
});

export default api;
