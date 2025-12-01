import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://jobsfor-u.vercel.app",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// OPTIONAL: Interceptor to catch errors
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;  // 🔥 THIS WAS MISSING
