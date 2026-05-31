import { Server, Socket } from 'socket.io';
import http from 'http';

let io: Server | null = null;
const userSockets = new Map<string, string>(); // userId -> socketId
const socketUsers = new Map<string, { userId: string; name: string; avatar: string; role: string; department: string; status: 'Online' | 'Busy' | 'Away' }>(); // socketId -> user details

export const initSocket = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Register user
    socket.on('user:register', (user: { id: string; name: string; avatar: string; role: string; department: string }) => {
      if (!user || !user.id) return;
      userSockets.set(user.id, socket.id);
      socketUsers.set(socket.id, {
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        department: user.department,
        status: 'Online'
      });

      console.log(`👤 User registered: ${user.name} (${user.id})`);

      // Broadcast active user list & status
      broadcastPresence();
    });

    // Handle status change
    socket.on('presence:status-change', (status: 'Online' | 'Busy' | 'Away') => {
      const user = socketUsers.get(socket.id);
      if (user) {
        user.status = status;
        broadcastPresence();
      }
    });

    // Join channel rooms
    socket.on('channel:join', (channelName: string) => {
      socket.join(channelName);
      console.log(`💬 Socket ${socket.id} joined channel room: ${channelName}`);
    });

    // Leave channel rooms
    socket.on('channel:leave', (channelName: string) => {
      socket.leave(channelName);
      console.log(`💬 Socket ${socket.id} left channel room: ${channelName}`);
    });

    // Realtime Kanban Board update
    socket.on('task:move', (data: { taskId: string; fromStatus: string; toStatus: string; updatedBy: string }) => {
      // Broadcast to everyone else
      socket.broadcast.emit('task:moved', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      const user = socketUsers.get(socket.id);
      if (user) {
        userSockets.delete(user.userId);
        socketUsers.delete(socket.id);
        console.log(`🔌 Client disconnected: ${socket.id} (${user.name})`);
        broadcastPresence();
      } else {
        console.log(`🔌 Client disconnected: ${socket.id}`);
      }
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Send direct notification
export const sendDirectNotification = (userId: string, notification: any): boolean => {
  if (!io) return false;
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit('notification:new', notification);
    return true;
  }
  return false;
};

// Send direct message
export const sendDirectMessage = (recipientId: string, message: any): boolean => {
  if (!io) return false;
  const socketId = userSockets.get(recipientId.toString());
  if (socketId) {
    io.to(socketId).emit('message:new', message);
    return true;
  }
  return false;
};

// Broadcast to room (channel)
export const broadcastToChannel = (channelName: string, event: string, data: any): void => {
  if (!io) return;
  io.to(channelName).emit(event, data);
};

// Helper: Broadcast current online presence states
const broadcastPresence = () => {
  if (!io) return;
  const presenceList = Array.from(socketUsers.values()).map(user => ({
    id: user.userId,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    department: user.department,
    status: user.status
  }));

  io.emit('presence:list', presenceList);
};
