import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

// Extend global to store socket server
declare global {
  var socketIO: SocketIOServer | undefined;
}

export const runtime = 'nodejs';

// In-memory storage for online users (in production, use Redis)
const onlineUsers = new Set<string>();
const userSockets = new Map<string, string>(); // userId -> socketId

function initSocketIO() {
  if (global.socketIO) {
    return global.socketIO;
  }

  // Create HTTP server for Socket.IO
  const httpServer = new HTTPServer();
  const io = new SocketIOServer(httpServer, {
    path: '/api/realtime/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Main connection handler
  io.on('connection', (socket) => {
    console.log('[Socket.IO] Client connected:', socket.id);

    // Presence handling
    socket.on('presence:online', (userId: string) => {
      console.log('[Presence] User online:', userId);
      onlineUsers.add(userId);
      userSockets.set(userId, socket.id);
      socket.join(`user:${userId}`);

      // Broadcast to all clients
      io.emit('presence:update', { userId, online: true });
    });

    // DM handling
    socket.on('dm:join', ({ roomKey, userId }: { roomKey: string; userId: string }) => {
      console.log('[DM] Join room:', roomKey);
      socket.join(`dm:${roomKey}`);
      socket.data.userId = userId;
    });

    socket.on('dm:send', ({ toUserId, message, fromUserId }: { toUserId: string; message: string; fromUserId: string }) => {
      console.log('[DM] Send message from', fromUserId, 'to', toUserId);
      const roomKey = [fromUserId, toUserId].sort().join('|');

      // Emit to everyone in the DM room
      io.to(`dm:${roomKey}`).emit('dm:new', {
        id: `dm-${Date.now()}`,
        fromUserId,
        toUserId,
        message,
        createdAt: new Date().toISOString(),
      });
    });

    // Room handling
    socket.on('room:join', ({ roomId, userId }: { roomId: string; userId: string }) => {
      console.log('[Room] Join:', roomId, 'by', userId);
      socket.join(`room:${roomId}`);
      socket.data.roomId = roomId;
      socket.data.userId = userId;

      // Notify others
      socket.to(`room:${roomId}`).emit('room:member-join', {
        userId,
        socketId: socket.id,
      });
    });

    socket.on('room:leave', ({ roomId }: { roomId: string }) => {
      console.log('[Room] Leave:', roomId);
      socket.leave(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('room:member-leave', {
        userId: socket.data.userId,
      });
    });

    socket.on('room:chat', ({ roomId, message, userId }: { roomId: string; message: string; userId: string }) => {
      console.log('[Room] Chat in', roomId, ':', message);
      io.to(`room:${roomId}`).emit('room:message', {
        id: `msg-${Date.now()}`,
        roomId,
        fromUserId: userId,
        message,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on('room:cursor', ({ roomId, x, y, userId, userName }: any) => {
      // Broadcast to others in room (not self)
      socket.to(`room:${roomId}`).emit('room:cursor', {
        userId,
        userName,
        x,
        y,
        color: `hsl(${Math.abs(userId.charCodeAt(0) * 137) % 360}, 70%, 60%)`,
      });
    });

    socket.on('room:scene', ({ roomId, elements, appState }: { roomId: string; elements: any[]; appState: any }) => {
      // Broadcast scene updates to others in room (not self)
      socket.to(`room:${roomId}`).emit('room:scene-update', {
        elements,
        appState,
        timestamp: Date.now(),
      });
    });

    // Room chat send (from client)
    socket.on('chat:send', ({ roomId, message }: { roomId: string; message: any }) => {
      console.log('[Room] Chat send:', roomId, message.id);
      // Broadcast to all in room
      io.to(`room:${roomId}`).emit('chat:new', message);
    });

    // Room permission update (from API)
    socket.on('perm:broadcast', ({ roomId, permissions }: { roomId: string; permissions: any }) => {
      console.log('[Room] Permission update:', roomId);
      io.to(`room:${roomId}`).emit('perm:update', permissions);
    });

    // Room AI blocks (from API)
    socket.on('ai:broadcast', ({ roomId, blocks }: { roomId: string; blocks: any[] }) => {
      console.log('[Room] AI blocks:', roomId, blocks.length);
      io.to(`room:${roomId}`).emit('ai:blocks', { roomId, blocks });
    });

    // Room control update (from API or client)
    socket.on('control:broadcast', ({ roomId, controllerUserId }: { roomId: string; controllerUserId: string | null }) => {
      console.log('[Room] Control update:', roomId, 'controller:', controllerUserId);
      io.to(`room:${roomId}`).emit('control:update', { controllerUserId });
    });

    // Group Chat handling
    socket.on('group:join', ({ groupId, userId }: { groupId: string; userId: string }) => {
      console.log('[Group] Join:', groupId, 'by', userId);
      socket.join(`group:${groupId}`);
      socket.data.groupId = groupId;
      socket.data.userId = userId;

      // Notify others
      socket.to(`group:${groupId}`).emit('group:member-join', {
        userId,
        socketId: socket.id,
      });
    });

    socket.on('group:leave', ({ groupId }: { groupId: string }) => {
      console.log('[Group] Leave:', groupId);
      socket.leave(`group:${groupId}`);
      socket.to(`group:${groupId}`).emit('group:member-leave', {
        userId: socket.data.userId,
      });
    });

    socket.on('group:new', ({ groupId, message }: { groupId: string; message: any }) => {
      console.log('[Group] New message in', groupId);
      // Broadcast to all members in the group room
      io.to(`group:${groupId}`).emit('group:message', message);
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log('[Socket.IO] Client disconnected:', socket.id);

      // Remove from online users
      const userId = socket.data.userId;
      if (userId) {
        onlineUsers.delete(userId);
        userSockets.delete(userId);
        io.emit('presence:update', { userId, online: false });
      }

      // Leave rooms
      if (socket.data.roomId) {
        socket.to(`room:${socket.data.roomId}`).emit('room:member-leave', {
          userId: socket.data.userId,
        });
      }
    });
  });

  global.socketIO = io;

  // Start listening on a port (Socket.IO will handle its own server)
  const PORT = 3001;
  httpServer.listen(PORT, () => {
    console.log(`[Socket.IO] Server listening on port ${PORT}`);
  });

  return io;
}

export async function GET(req: NextRequest) {
  try {
    const io = initSocketIO();

    return new Response(
      JSON.stringify({
        status: 'ok',
        message: 'Socket.IO server initialized',
        connections: io.engine.clientsCount,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Socket.IO] Error:', error);
    return new Response(
      JSON.stringify({ status: 'error', message: 'Failed to initialize socket server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
