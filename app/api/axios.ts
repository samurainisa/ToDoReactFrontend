import axios from "axios";
import { tokenManager } from "./auth/token-manager";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config.url !== "/auth/login") {
      tokenManager.removeToken();
      window.dispatchEvent(new CustomEvent("auth:logout"));
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
