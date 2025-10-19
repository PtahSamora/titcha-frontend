import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { checkRateLimit } from '@/lib/ratelimit';
import { log, logError } from '@/lib/log';
import { getStudyRoomById, ensureRoomPermissions, ensureRoomControl, addRoomMessage } from '@/lib/devdb';

/**
 * POST /api/rooms/[roomId]/ask
 * Ask AI question in room context (permission enforced)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireUser();
    const { roomId } = await params;

    log('Ask AI attempt:', { roomId, userId: user.userId });

    // Rate limiting: 5 AI questions per minute
    const rateLimitKey = `room:ask:${user.userId}:${roomId}`;
    if (!checkRateLimit(rateLimitKey, 5, 60000)) {
      return NextResponse.json(
        { success: false, code: 'RATE_LIMIT', message: 'Too many AI requests. Please wait.' },
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

    // Check exclusive control (v3 feature)
    const control = await ensureRoomControl(roomId);
    const isOwner = room.ownerUserId === user.userId;

    // Exclusive control logic:
    // - If controllerUserId is null → use old permission system (askAiEnabled, memberAskAi)
    // - If controllerUserId is set → ONLY that user can ask AI (exclusive control)
    // - Owner can always override and take control via /control API

    if (control.controllerUserId !== null) {
      // Exclusive control mode: only controller can ask
      if (user.userId !== control.controllerUserId) {
        logError('Ask AI denied: exclusive control', { roomId, userId: user.userId, controllerId: control.controllerUserId });
        return NextResponse.json(
          {
            success: false,
            code: 'NO_CONTROL',
            message: 'Another member currently has exclusive Ask-AI control',
            data: {
              controllerUserId: control.controllerUserId,
            },
          },
          { status: 403 }
        );
      }
    } else {
      // No exclusive control: use old permission system
      const permissions = await ensureRoomPermissions(roomId);

      // Permission logic:
      // - Owner always allowed
      // - If askAiEnabled is false, no one except owner can ask
      // - If askAiEnabled is true AND memberAskAi is non-empty, only those in list can ask
      // - If askAiEnabled is true AND memberAskAi is empty, all members can ask

      if (!isOwner) {
        if (!permissions.askAiEnabled) {
          logError('Ask AI denied: disabled', { roomId, userId: user.userId });
          return NextResponse.json(
            { success: false, code: 'ASK_AI_DISABLED', message: 'AI questions are currently disabled in this room' },
            { status: 403 }
          );
        }

        if (permissions.memberAskAi.length > 0 && !permissions.memberAskAi.includes(user.userId)) {
          logError('Ask AI denied: not in whitelist', { roomId, userId: user.userId });
          return NextResponse.json(
            { success: false, code: 'ASK_AI_DISABLED', message: 'You do not have permission to ask AI questions' },
            { status: 403 }
          );
        }
      }
    }

    const body = await request.json();
    const { prompt, type = 'question' } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, message: 'Prompt cannot be empty' },
        { status: 400 }
      );
    }

    // Call tutor service (simplified mock for now)
    // In production, integrate with existing /api/tutor/answer
    const blocks = await callTutorService(prompt, room.subject, roomId);

    // Save system message to chat
    const summary = blocks[0]?.content?.substring(0, 80) || 'AI response';
    await addRoomMessage(roomId, 'system', `🤖 AI: ${summary}...`);

    log('Ask AI successful:', { roomId, userId: user.userId, blocksCount: blocks.length });

    // TODO: Emit socket event "room:ai" with blocks to all members

    return NextResponse.json(
      {
        success: true,
        data: {
          blocks,
          roomId,
          subject: room.subject,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError('Ask AI error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, code: 'UNAUTHORIZED', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, code: 'INTERNAL_ERROR', message: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

/**
 * Mock tutor service call
 * In production, integrate with existing tutor API
 */
async function callTutorService(prompt: string, subject: string, roomId: string) {
  // Simplified mock response
  // In production, call your existing /api/tutor/answer with room context
  return [
    {
      type: 'text',
      content: `Here's help with your ${subject} question: ${prompt}\n\nThis is a sample AI response. In production, this would call the actual tutor service.`,
    },
    {
      type: 'text',
      content: 'Would you like me to explain further or provide examples?',
    },
  ];
}
