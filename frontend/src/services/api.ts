import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach Authorization header if JWT token is stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careerconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: string[] }>) => {
    if (error.response?.status === 401) {
      // If unauthorized and we had a token, session might have expired
      const hadToken = !!localStorage.getItem('careerconnect_token');
      if (hadToken && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('careerconnect_token');
        localStorage.removeItem('careerconnect_user');
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
