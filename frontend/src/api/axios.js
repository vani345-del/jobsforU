

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://jobsfor-u.vercel.app',
  withCredentials: true, // ✅ CRITICAL: Set globally
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;