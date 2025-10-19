import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { checkRateLimit } from '@/lib/ratelimit';
import { log, logError } from '@/lib/log';
import { getStudyRoomById, addRoomMessage, listRoomMessages } from '@/lib/devdb';

/**
 * GET /api/rooms/[roomId]/messages
 * Fetch room chat messages (requires membership)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireUser();
    const { roomId } = await params;

    // Check room exists and user is member
    const room = await getStudyRoomById(roomId);
    if (!room) {
      return NextResponse.json(
        { success: false, code: 'ROOM_NOT_FOUND', message: 'Room not found' },
        { status: 404 }
      );
    }

    if (!room.memberUserIds.includes(user.userId)) {
      return NextResponse.json(
        { success: false, code: 'NOT_MEMBER', message: 'Not a member of this room' },
        { status: 403 }
      );
    }

    const messages = await listRoomMessages(roomId);

    return NextResponse.json(
      {
        success: true,
        data: messages,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError('Get room messages error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, code: 'UNAUTHORIZED', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, code: 'INTERNAL_ERROR', message: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rooms/[roomId]/messages
 * Send a message to room chat (requires membership, rate limited)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireUser();
    const { roomId } = await params;

    // Rate limiting: 10 messages per 10 seconds per user per room
    const rateLimitKey = `room:chat:${user.userId}:${roomId}`;
    if (!checkRateLimit(rateLimitKey, 10, 10000)) {
      return NextResponse.json(
        { success: false, code: 'RATE_LIMIT', message: 'Rate limit exceeded. Please slow down.' },
        { status: 429 }
      );
    }

    // Check room exists and user is member
    const room = await getStudyRoomById(roomId);
    if (!room) {
      return NextResponse.json(
        { success: false, code: 'ROOM_NOT_FOUND', message: 'Room not found' },
        { status: 404 }
      );
    }

    if (!room.memberUserIds.includes(user.userId)) {
      return NextResponse.json(
        { success: false, code: 'NOT_MEMBER', message: 'Not a member of this room' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, message: 'Message must be at most 2000 characters' },
        { status: 400 }
      );
    }

    const newMessage = await addRoomMessage(roomId, user.userId, message.trim());

    log('Room message sent:', { roomId, userId: user.userId, messageId: newMessage.id });

    // TODO: Emit socket event "room:chat" with message to room namespace

    return NextResponse.json(
      {
        success: true,
        data: newMessage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError('Send room message error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, code: 'UNAUTHORIZED', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, code: 'INTERNAL_ERROR', message: 'Failed to send message' },
      { status: 500 }
    );
  }
}
