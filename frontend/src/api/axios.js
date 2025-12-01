const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://jobsfor-u.vercel.app',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity
});
