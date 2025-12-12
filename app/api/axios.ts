import axios from "axios";
import { Toast } from 'primereact/toast';
import { useToast } from "../ui/toast-provider";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
  },
}).interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  if (error.response?.status === 401 && error.config.url !== "/auth/login") {
    localStorage.removeItem("token");
    useToast().show({ severity: "error", summary: "Error", detail: error.response?.data.message, life: 3000 });
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);
