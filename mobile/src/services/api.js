import axios from 'axios';
import { SERVER_URL } from './socket';

const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  guestLogin: (guestData) => api.post('/auth/guest', guestData)
};

export const chatApi = {
  getRooms: () => api.get('/rooms'),
  createRoom: (roomData) => api.post('/rooms', roomData),
  getMessageHistory: (roomSlug) => api.get(`/messages/${roomSlug}`)
};

export default api;
