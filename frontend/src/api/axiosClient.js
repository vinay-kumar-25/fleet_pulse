import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const extractApiUrl = (value) => {
  const markdownTarget = value.match(/\]\(([^)]+)\)/)?.[1];
  const url = (markdownTarget || value).trim();
  return url.replace(/^(https?):\/{1,2}/i, '$1://');
};

const apiBaseUrl = extractApiUrl(configuredBaseUrl)
  .replace(/\/+$/, '')
  .replace(/\/api$/i, '') + '/api';

const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;






