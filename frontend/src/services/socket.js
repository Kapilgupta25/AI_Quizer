import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socket = null;

export const getSocket = () => {
  if (!socket || !socket.connected) {
    const token = useAuthStore.getState().accessToken;

    socket = io('/', {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
    socket.on('disconnect', (reason) => console.log('[Socket] Disconnected:', reason));
    socket.on('connect_error', (err) => console.error('[Socket] Error:', err.message));
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};