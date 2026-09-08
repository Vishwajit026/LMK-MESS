import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected to LMK MESS server:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ Socket connection error:', error.message);
    });
  }
  return socket;
};

export const connectSocket = (user, currentRoom = 'general') => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  if (user) {
    s.emit('userConnected', {
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      status: user.status || 'online',
      isGuest: Boolean(user.isGuest),
      currentRoom
    });
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
