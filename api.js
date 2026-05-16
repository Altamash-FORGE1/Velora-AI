import axios from 'axios';

const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;
  
  // Auto-detect GitHub Codespaces environment and route to port 5000
  if (typeof window !== 'undefined' && window.location.hostname.includes('.github.dev')) {
    return `https://${window.location.hostname.replace('-5173', '-5000')}`;
  }
  return 'http://localhost:5000';
};

export const BACKEND_URL = getBackendUrl();

const api = axios.create({
  // Points to the Flask backend defined in docker-compose
  baseURL: `${BACKEND_URL}/api`,
});

// Automatically attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('velora_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;