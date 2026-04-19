import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000, // 8 s — fail fast when backend is down
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('echochain_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('echochain_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
