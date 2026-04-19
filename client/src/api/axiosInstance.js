import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 min — analyses can take time
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: attach JWT ──────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: normalize errors ───────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      toast.error("Session expired. Please log in again.");
    } else if (status === 429) {
      toast.error("Rate limit reached. Please slow down.");
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject({ message, status, data: error.response?.data });
  }
);

export default axiosInstance;
