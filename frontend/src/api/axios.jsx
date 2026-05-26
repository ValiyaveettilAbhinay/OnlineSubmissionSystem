import axios from 'axios';

const API = axios.create({
  baseURL: 'https://onlinesubsytem-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to append Authorization JWT tokens dynamically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;