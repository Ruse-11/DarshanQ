import { io } from 'socket.io-client';

/**
 * Socket.IO client singleton.
 * Import this wherever you need real-time updates.
 *
 * Usage:
 *   import socket from '../lib/socket';
 *   socket.emit('join:temple', { temple_id });
 *   socket.on('queue:update', handler);
 */
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false, // Connect only after login
});

export default socket;
