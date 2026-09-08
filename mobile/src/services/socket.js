import { io } from 'socket.io-client';
import { Platform } from 'react-native';

// For Android emulator use 10.0.2.2, for physical device use LAN IP (e.g. 192.168.1.x)
export const SERVER_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      transports: ['websocket']
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
