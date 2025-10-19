import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { log, logError } from '@/lib/log';
import {
  getStudyRoomById,
  joinRoom,
  findUserByEmail,
} from '@/lib/devdb';

/**
 * POST /api/rooms/[roomId]/invite
 * Invite a user to a study room by email (owner only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireUser();
    const { roomId } = await params;
    const { userEmail } = await request.json();

    log('Invite to room:', { roomId, userEmail, invitedBy: user.userId });

    // Validate input
    if (!userEmail || typeof userEmail !== 'string') {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_INPUT',
          message: 'User email is required',
        },
        { status: 400 }
      );
    }

    // Check if room exists
    const room = await getStudyRoomById(roomId);
    if (!room) {
      logError('Room not found:', roomId);
      return NextResponse.json(
        {
          success: false,
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found',
        },
        { status: 404 }
      );
    }

    // Check if user is the room owner
    if (room.ownerUserId !== user.userId) {
      logError('Unauthorized invite attempt:', {
        userId: user.userId,
        roomOwnerId: room.ownerUserId,
      });
      return NextResponse.json(
        {
          success: false,
          code: 'UNAUTHORIZED',
          message: 'Only the room owner can invite members',
        },
        { status: 403 }
      );
    }

    // Find user to invite
    const invitedUser = await findUserByEmail(userEmail);
    if (!invitedUser) {
      logError('User not found:', userEmail);
      return NextResponse.json(
        {
          success: false,
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Check same-school requirement
    if (user.schoolId && invitedUser.schoolId && user.schoolId !== invitedUser.schoolId) {
      logError('Cross-school invite attempt:', {
        inviterSchool: user.schoolId,
        invitedSchool: invitedUser.schoolId,
      });
      return NextResponse.json(
        {
          success: false,
          code: 'CROSS_SCHOOL',
          message: 'You can only invite users from the same school',
        },
        { status: 403 }
      );
    }

    // Check if user is already a member
    if (room.memberUserIds.includes(invitedUser.id)) {
      return NextResponse.json(
        {
          success: false,
          code: 'ALREADY_MEMBER',
          message: 'User is already a member of this room',
        },
        { status: 400 }
      );
    }

    // Add user to room
    await joinRoom(roomId, invitedUser.id);
    log('User invited successfully:', {
      roomId,
      invitedUserId: invitedUser.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User invited successfully',
        user: {
          id: invitedUser.id,
          email: invitedUser.email,
          displayName: invitedUser.displayName,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError('Invite to room error:', error);

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
        message: 'Failed to invite user to room',
      },
      { status: 500 }
    );
  }
}
