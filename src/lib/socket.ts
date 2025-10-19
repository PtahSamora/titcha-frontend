import { io, Socket } from 'socket.io-client';

// Singleton socket instances
let presenceSocket: Socket | null = null;
let dmSocket: Socket | null = null;
let roomSocket: Socket | null = null;
let groupSocket: Socket | null = null;

// Base URL for sockets
const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : '';

// Presence Socket
export function getPresenceSocket(): Socket {
  if (!presenceSocket && typeof window !== 'undefined') {
    presenceSocket = io(SOCKET_URL, {
      path: '/api/realtime/socket',
      addTrailingSlash: false,
      autoConnect: false,
    });
  }
  return presenceSocket!;
}

export function connectPresence(userId: string) {
  const socket = getPresenceSocket();
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit('presence:online', userId);
  return socket;
}

export function disconnectPresence() {
  if (presenceSocket) {
    presenceSocket.disconnect();
  }
}

// DM Socket
export function getDMSocket(): Socket {
  if (!dmSocket && typeof window !== 'undefined') {
    dmSocket = io(SOCKET_URL, {
      path: '/api/realtime/socket',
      addTrailingSlash: false,
      autoConnect: false,
    });
  }
  return dmSocket!;
}

export function sendDM(toUserId: string, message: string, fromUserId: string) {
  const socket = getDMSocket();
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit('dm:send', { toUserId, message, fromUserId });
}

export function openDMChannel(userId: string, friendUserId: string, callback: (data: any) => void) {
  const socket = getDMSocket();
  if (!socket.connected) {
    socket.connect();
  }

  // Join DM room
  const roomKey = [userId, friendUserId].sort().join('|');
  socket.emit('dm:join', { roomKey, userId });

  // Listen for new messages
  socket.off('dm:new'); // Remove old listeners
  socket.on('dm:new', callback);

  return () => {
    socket.off('dm:new', callback);
  };
}

// Room Socket
export function getRoomSocket(): Socket {
  if (!roomSocket && typeof window !== 'undefined') {
    roomSocket = io(SOCKET_URL, {
      path: '/api/realtime/socket',
      addTrailingSlash: false,
      autoConnect: false,
    });
  }
  return roomSocket!;
}

export function joinRoom(roomId: string, userId: string) {
  const socket = getRoomSocket();
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit('room:join', { roomId, userId });
  return socket;
}

export function sendRoomChat(roomId: string, message: string, userId: string) {
  const socket = getRoomSocket();
  socket.emit('room:chat', { roomId, message, userId });
}

export function sendRoomCursor(roomId: string, x: number, y: number, userId: string, userName: string) {
  const socket = getRoomSocket();
  socket.emit('room:cursor', { roomId, x, y, userId, userName });
}

export function subscribeRoomEvents(
  roomId: string,
  handlers: {
    onChat?: (data: any) => void;
    onCursor?: (data: any) => void;
    onMemberJoin?: (data: any) => void;
  }
) {
  const socket = getRoomSocket();

  if (handlers.onChat) {
    socket.off('room:message');
    socket.on('room:message', handlers.onChat);
  }

  if (handlers.onCursor) {
    socket.off('room:cursor');
    socket.on('room:cursor', handlers.onCursor);
  }

  if (handlers.onMemberJoin) {
    socket.off('room:member-join');
    socket.on('room:member-join', handlers.onMemberJoin);
  }

  return () => {
    if (handlers.onChat) socket.off('room:message', handlers.onChat);
    if (handlers.onCursor) socket.off('room:cursor', handlers.onCursor);
    if (handlers.onMemberJoin) socket.off('room:member-join', handlers.onMemberJoin);
  };
}

export function leaveRoom(roomId: string) {
  const socket = getRoomSocket();
  socket.emit('room:leave', { roomId });
}

export function disconnectRoom() {
  if (roomSocket) {
    roomSocket.disconnect();
  }
}

// Group Socket
export function getGroupSocket(): Socket {
  if (!groupSocket && typeof window !== 'undefined') {
    groupSocket = io(SOCKET_URL, {
      path: '/api/realtime/socket',
      addTrailingSlash: false,
      autoConnect: false,
    });
  }
  return groupSocket!;
}

export function joinGroup(groupId: string, userId: string) {
  const socket = getGroupSocket();
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit('group:join', { groupId, userId });
  return socket;
}

export function leaveGroup(groupId: string) {
  const socket = getGroupSocket();
  socket.emit('group:leave', { groupId });
}

export function sendGroupMessage(groupId: string, message: any) {
  const socket = getGroupSocket();
  socket.emit('group:new', { groupId, message });
}

export function subscribeGroupEvents(
  groupId: string,
  handlers: {
    onMessage?: (data: any) => void;
    onMemberJoin?: (data: any) => void;
    onMemberLeave?: (data: any) => void;
  }
) {
  const socket = getGroupSocket();

  if (handlers.onMessage) {
    socket.off('group:message');
    socket.on('group:message', handlers.onMessage);
  }

  if (handlers.onMemberJoin) {
    socket.off('group:member-join');
    socket.on('group:member-join', handlers.onMemberJoin);
  }

  if (handlers.onMemberLeave) {
    socket.off('group:member-leave');
    socket.on('group:member-leave', handlers.onMemberLeave);
  }

  return () => {
    if (handlers.onMessage) socket.off('group:message', handlers.onMessage);
    if (handlers.onMemberJoin) socket.off('group:member-join', handlers.onMemberJoin);
    if (handlers.onMemberLeave) socket.off('group:member-leave', handlers.onMemberLeave);
  };
}

export function disconnectGroup() {
  if (groupSocket) {
    groupSocket.disconnect();
  }
}
