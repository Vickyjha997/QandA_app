import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      toast.error('Session expired. Please login again.');
      setTimeout(() => window.location.href = '/login', 1500);
    }
    return Promise.reject(error);
  }
);

export default api;
