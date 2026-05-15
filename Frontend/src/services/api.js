/**
 * services/api.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Instance Axios terpusat untuk seluruh request ke backend.
 * Otomatis menyisipkan Bearer Token dari localStorage di setiap request.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ─── Request Interceptor — sisipkan token otomatis ────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — tangani error global ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.error || error.message;

    if (status === 401) {
      // Token expired / invalid → paksa logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Kembalikan error yang sudah di-format
    return Promise.reject({ status, message, original: error });
  }
);

export default api;
