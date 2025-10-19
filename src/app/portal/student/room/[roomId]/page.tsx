'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { log, logError } from '@/lib/log';
import { RoomLayout } from '@/components/rooms/RoomLayout';
import { io, Socket } from 'socket.io-client';

type JoinState =
  | { status: 'loading' }
  | { status: 'error'; code: string; message: string }
  | { status: 'joined'; data: any };

export default function StudyRoomPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status: authStatus } = useSession();
  const roomId = params.roomId as string;

  const [joinState, setJoinState] = useState<JoinState>({ status: 'loading' });
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (authStatus === 'authenticated' && session?.user && roomId) {
      attemptJoin();
    }
  }, [authStatus, session, roomId]);

  const attemptJoin = async () => {
    try {
      log('Attempting to join room:', roomId);
      setJoinState({ status: 'loading' });

      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
      });

      const data = await response.json();

      log('Join response:', { status: response.status, data });

      if (response.status === 404) {
        // Room not found
        setJoinState({
          status: 'error',
          code: data.code || 'ROOM_NOT_FOUND',
          message: data.message || 'Room not found',
        });
        return;
      }

      if (response.status === 403) {
        // Cross-school or other forbidden
        setJoinState({
          status: 'error',
          code: data.code || 'FORBIDDEN',
          message: data.message || 'Access denied',
        });
        return;
      }

      if (!response.ok || !data.success) {
        setJoinState({
          status: 'error',
          code: data.code || 'ERROR',
          message: data.message || 'Failed to join room',
        });
        return;
      }

      // Successfully joined
      log('Join successful, initializing socket');
      setJoinState({ status: 'joined', data });

      // Initialize socket
      initSocket(data);
    } catch (error: any) {
      logError('Join error:', error);
      setJoinState({
        status: 'error',
        code: 'NETWORK_ERROR',
        message: 'Network error. Please try again.',
      });
    }
  };

  const initSocket = (roomData: any) => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      path: '/api/realtime/socket',
      addTrailingSlash: false,
    });

    newSocket.on('connect', () => {
      log('Socket connected:', newSocket.id);
      newSocket.emit('room:join', { roomId, userId: session?.user?.id });
    });

    newSocket.on('disconnect', () => {
      log('Socket disconnected');
    });

    newSocket.on('error', (error: any) => {
      logError('Socket error:', error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      log('Cleaning up socket');
      newSocket.emit('room:leave', { roomId });
      newSocket.disconnect();
    };
  };

  // Loading state
  if (joinState.status === 'loading' || authStatus === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Joining room...</p>
        </div>
      </div>
    );
  }

  // Error state (padlock)
  if (joinState.status === 'error') {
    const errorDetails = {
      ROOM_NOT_FOUND: {
        icon: '🔍',
        title: 'Room Not Found',
        description: 'This study room does not exist or has been deleted.',
      },
      CROSS_SCHOOL: {
        icon: '🔒',
        title: 'Access Restricted',
        description: 'You must be from the same school as the room owner to join.',
      },
      FORBIDDEN: {
        icon: '🔒',
        title: 'Access Denied',
        description: joinState.message,
      },
      NETWORK_ERROR: {
        icon: '⚠️',
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection.',
      },
    };

    const error = errorDetails[joinState.code as keyof typeof errorDetails] || {
      icon: '❌',
      title: 'Error',
      description: joinState.message,
    };

    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">{error.icon}</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{error.title}</h2>
          <p className="text-gray-600 mb-8 text-lg">{error.description}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => attemptJoin()}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              🔄 Retry
            </button>
            <button
              onClick={() => router.push('/portal/student/dashboard')}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Successfully joined - render the room
  if (joinState.status === 'joined' && socket) {
    return (
      <RoomLayout
        roomId={roomId}
        room={joinState.data.room}
        members={joinState.data.members}
        permissions={joinState.data.permissions}
        control={joinState.data.control}
        me={joinState.data.me}
        socket={socket}
        initialSnapshot={joinState.data.snapshot}
      />
    );
  }

  // Fallback
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">Initializing...</p>
    </div>
  );
}
