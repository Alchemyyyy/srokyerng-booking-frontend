import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken = null;
let refreshHandler = null;
let logoutHandler = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const setAuthHandlers = ({ refresh, logout } = {}) => {
  refreshHandler = refresh || null;
  logoutHandler = logout || null;
};

http.interceptors.request.use((config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const shouldTryRefresh =
      status === 401 &&
      refreshHandler &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh-token");

    if (shouldTryRefresh) {
      originalRequest._retry = true;

      try {
        refreshPromise ||= refreshHandler();
        await refreshPromise;
        refreshPromise = null;

        return http(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        logoutHandler?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default http;
