import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("showcase_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401, the token is invalid/expired or user no longer exists
    if (error.response?.status === 401) {
      localStorage.removeItem("showcase_token");
      window.dispatchEvent(new Event("unauthorized"));
    }

    // Server responded with an error status
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    // Network error or request was never completed
    const message = error.code === "ERR_NETWORK"
      ? "Cannot connect to the server. Please start both frontend and backend using: npm run dev (from project root)."
      : error.message || "An unexpected error occurred.";
    return Promise.reject({ success: false, message });
  }
);

export default api;

