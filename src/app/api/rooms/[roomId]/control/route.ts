import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { log, logError } from '@/lib/log';
import {
  getStudyRoomById,
  isRoomMember,
  setRoomControl,
  ensureRoomControl,
} from '@/lib/devdb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireUser();
    const { roomId } = await params;
    const body = await request.json();
    const { action, targetUserId } = body;

    log('Control request:', { roomId, userId: user.userId, action, targetUserId });

    // Validate action
    if (!action || !['give', 'revoke', 'take'].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid action. Must be "give", "revoke", or "take"',
        },
        { status: 400 }
      );
    }

    // Check if room exists
    const room = await getStudyRoomById(roomId);
    if (!room) {
      return NextResponse.json(
        {
          success: false,
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found',
        },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (room.ownerUserId !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          code: 'NOT_OWNER',
          message: 'Only the room owner can manage control',
        },
        { status: 403 }
      );
    }

    let newControllerId: string | null = null;

    switch (action) {
      case 'give':
        // Give control to target user
        if (!targetUserId) {
          return NextResponse.json(
            {
              success: false,
              message: 'targetUserId is required for "give" action',
            },
            { status: 400 }
          );
        }

        // Check if target is a member
        const isTargetMember = await isRoomMember(roomId, targetUserId);
        if (!isTargetMember) {
          return NextResponse.json(
            {
              success: false,
              message: 'Target user is not a member of this room',
            },
            { status: 400 }
          );
        }

        newControllerId = targetUserId;
        break;

      case 'revoke':
        // Revoke control (set to null)
        newControllerId = null;
        break;

      case 'take':
        // Owner takes control
        newControllerId = user.userId;
        break;
    }

    // Update control
    const control = await setRoomControl(roomId, newControllerId);

    log('Control updated:', { roomId, newControllerId, action });

    // Emit socket event to notify all members
    // Note: This will be handled by the client socket emit or server-side socket
    // For now, we return the data and let the client emit the event

    return NextResponse.json(
      {
        success: true,
        data: {
          controllerUserId: control.controllerUserId,
          action,
        },
        meta: {
          // Include socket event data for client to emit
          socketEvent: 'control:update',
          socketData: {
            roomId,
            controllerUserId: control.controllerUserId,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError('Control update error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          success: false,
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'Failed to update control',
      },
      { status: 500 }
    );
  }
}
