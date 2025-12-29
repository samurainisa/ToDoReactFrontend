import axios from "axios";
import { tokenManager } from "./auth/token-manager";
import { useSystemStore } from "./system/system-store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    let loadingDisabled = false;
    const params = config.params;

    if (params instanceof URLSearchParams) {
      const value = params.get("loading");
      loadingDisabled = value === "false";
      if (value !== null) params.delete("loading");
    } else if (params && typeof params === "object") {
      const record = params as Record<string, unknown>;
      const value = record.loading;
      loadingDisabled = value === false || value === "false";
      if (Object.prototype.hasOwnProperty.call(record, "loading")) {
        delete record.loading;
      }
    }

    config.metadata = { loading: loadingDisabled ? false : undefined };

    if (!loadingDisabled) {
      useSystemStore.getState().incrementLoadingCounter();
    }

    return config;
  },
  (reason) => {
    if (reason?.config?.metadata?.loading !== false) {
      useSystemStore.getState().decrementLoadingCounter();
    }
    return Promise.reject(reason);
  }
);

api.interceptors.response.use(
  (response) => {
    if (response.config.metadata?.loading !== false) {
      useSystemStore.getState().decrementLoadingCounter();
    }
    return response;
  },
  (error) => {
    const url = error.config?.url;
    if (error.config?.metadata?.loading !== false) {
      useSystemStore.getState().decrementLoadingCounter();
    }
    if (error.response?.status === 401 && url !== "/auth/login" && url !== "/auth/register") {
      tokenManager.removeToken();
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
    return Promise.reject(error);
  }
);
