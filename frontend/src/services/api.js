import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lmk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  guestLogin: (guestData) => api.post('/auth/guest', guestData),
  getMe: () => api.get('/auth/me')
};

export const chatApi = {
  getRooms: () => api.get('/rooms'),
  getRoomBySlug: (slug) => api.get(`/rooms/${slug}`),
  getRoomByCode: (code) => api.get(`/rooms/code/${code}`),
  verifyPassword: (slug, password) => api.post('/rooms/verify-password', { slug, password }),
  createRoom: (roomData) => api.post('/rooms', roomData),
  getMessageHistory: (roomSlug, page = 1, limit = 100) =>
    api.get(`/messages/${roomSlug}?page=${page}&limit=${limit}`),
  searchMessages: (roomSlug, query) =>
    api.get(`/messages/search/${roomSlug}?query=${encodeURIComponent(query)}`)
};

export default api;
