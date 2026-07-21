import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketManager {
  private static instance: Socket | null = null;

  public static getInstance(): Socket {
    if (!SocketManager.instance) {
      SocketManager.instance = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      SocketManager.instance.on('connect', () => {
        console.log('🔗 WebSocket connection established with GridPulse Backend');
      });

      SocketManager.instance.on('connect_error', (err) => {
        console.error('⚠️ WebSocket Connection Error:', err.message);
      });
    }
    return SocketManager.instance;
  }
}

export const socket = SocketManager.getInstance();