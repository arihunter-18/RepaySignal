import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('rs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — token expired or invalid
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rs_token');
      localStorage.removeItem('rs_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default client;