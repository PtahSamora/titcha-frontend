import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { log, logError } from '@/lib/log';
import {
  getStudyRoomById,
  joinRoom,
  listRoomMembers,
  getRoomSnapshot,
  ensureRoomPermissions,
  ensureRoomControl,
  findUserById,
} from '@/lib/devdb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireUser();
    const { roomId } = await params;

    log('Join attempt:', { roomId, userId: user.userId });

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

    // Get room owner to check school
    const owner = await findUserById(room.ownerUserId);
    if (!owner) {
      logError('Room owner not found:', room.ownerUserId);
      return NextResponse.json(
        {
          success: false,
          code: 'OWNER_NOT_FOUND',
          message: 'Room owner not found',
        },
        { status: 500 }
      );
    }

    // Check same-school requirement
    if (user.schoolId && owner.schoolId && user.schoolId !== owner.schoolId) {
      logError('Cross-school join attempt:', {
        userId: user.userId,
        userSchool: user.schoolId,
        ownerSchool: owner.schoolId,
      });
      return NextResponse.json(
        {
          success: false,
          code: 'CROSS_SCHOOL',
          message: 'You must be from the same school to join this room',
        },
        { status: 403 }
      );
    }

    // Auto-enroll if not already a member (same school)
    if (!room.memberUserIds.includes(user.userId)) {
      await joinRoom(roomId, user.userId);
      log('Auto-enrolled user:', user.userId);
    }

    // Load room data
    const members = await listRoomMembers(roomId);
    const snapshot = await getRoomSnapshot(roomId);
    const permissions = await ensureRoomPermissions(roomId);
    const control = await ensureRoomControl(roomId);

    // Map members with role
    const membersWithRole = members.map((m) => ({
      id: m.id,
      displayName: m.displayName,
      email: m.email,
      role: m.id === room.ownerUserId ? 'owner' : 'member',
    }));

    log('Join successful:', { roomId, userId: user.userId });

    return NextResponse.json(
      {
        success: true,
        joined: true,
        room: {
          id: room.id,
          name: room.name,
          subject: room.subject,
          ownerUserId: room.ownerUserId,
          inviteCode: room.inviteCode,
        },
        members: membersWithRole,
        snapshot: snapshot?.snapshot || null,
        permissions: {
          askAiEnabled: permissions.askAiEnabled,
          memberAskAi: permissions.memberAskAi,
        },
        control: {
          controllerUserId: control.controllerUserId,
        },
        me: {
          id: user.userId,
          isOwner: room.ownerUserId === user.userId,
          hasControl: user.userId === control.controllerUserId,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError('Join room error:', error);

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
        message: 'Failed to join room',
      },
      { status: 500 }
    );
  }
}
