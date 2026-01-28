import axios from 'axios';

// Create Axios instance
const API_HOST = window.location.hostname;
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${API_HOST}:3000/api`, // Dynamic based on hostname


  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Errors (401, etc.)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      // Optional: Redirect to login or trigger global event
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
