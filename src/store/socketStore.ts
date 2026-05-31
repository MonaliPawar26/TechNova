import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { User } from './authStore';
import { getBackendUrl } from '../lib/api';

export interface PresenceUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  status: 'Online' | 'Busy' | 'Away';
}

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: PresenceUser[];
  connectSocket: (user: User) => void;
  disconnectSocket: () => void;
  updateStatus: (status: 'Online' | 'Busy' | 'Away') => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: [],

  connectSocket: (user) => {
    // If socket is already connected, don't double connect
    if (get().socket?.connected) return;

    const socketUrl = getBackendUrl();
    const socket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true
    });

    socket.on('connect', () => {
      set({ isConnected: true });
      // Register user details
      socket.emit('user:register', {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        department: user.department
      });
    });

    socket.on('presence:list', (list: PresenceUser[]) => {
      set({ onlineUsers: list });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, onlineUsers: [] });
    }
  },

  updateStatus: (status) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit('presence:status-change', status);
    }
  }
}));
