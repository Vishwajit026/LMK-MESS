import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskplanet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear local auth
      const currentToken = localStorage.getItem('taskplanet_token');
      if (currentToken && !error.config.url.includes('/login') && !error.config.url.includes('/signup')) {
        console.warn('Session expired. Logging out...');
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API methods
export const authAPI = {
  signup: async (userData) => {
    const res = await api.post('/auth/signup', userData);
    return res.data;
  },
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

// Social Posts API methods
export const postAPI = {
  getPosts: async (params = {}) => {
    const res = await api.get('/posts', { params });
    return res.data;
  },
  getPost: async (id) => {
    const res = await api.get(`/posts/${id}`);
    return res.data;
  },
  createPost: async (postData) => {
    const res = await api.post('/posts', postData);
    return res.data;
  },
  toggleLike: async (postId) => {
    const res = await api.post(`/posts/${postId}/like`);
    return res.data;
  },
  addComment: async (postId, commentData) => {
    const res = await api.post(`/posts/${postId}/comment`, commentData);
    return res.data;
  },
  deleteComment: async (postId, commentId) => {
    const res = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return res.data;
  },
  deletePost: async (postId) => {
    const res = await api.delete(`/posts/${postId}`);
    return res.data;
  }
};

export default api;
