import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { log, logError } from '@/lib/log';
import {
  getStudyRoomById,
  listRoomMembers,
  isRoomMember,
  ensureRoomControl,
} from '@/lib/devdb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireUser();
    const { roomId } = await params;

    log('Get members:', { roomId, userId: user.userId });

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

    // Check if user is a member
    const isMember = await isRoomMember(roomId, user.userId);
    if (!isMember) {
      return NextResponse.json(
        {
          success: false,
          code: 'NOT_MEMBER',
          message: 'You must be a member to view room members',
        },
        { status: 403 }
      );
    }

    // Get members list
    const members = await listRoomMembers(roomId);

    // Get room control
    const control = await ensureRoomControl(roomId);

    // Map members with additional info
    const membersWithInfo = members.map((member) => ({
      id: member.id,
      displayName: member.displayName,
      email: member.email,
      isOwner: member.id === room.ownerUserId,
      hasControl: member.id === control.controllerUserId,
      online: false, // TODO: implement online presence
    }));

    log('Members loaded:', { roomId, count: membersWithInfo.length });

    return NextResponse.json(
      {
        success: true,
        data: {
          members: membersWithInfo,
          control: {
            controllerUserId: control.controllerUserId,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError('Get members error:', error);

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
        message: 'Failed to get members',
      },
      { status: 500 }
    );
  }
}
