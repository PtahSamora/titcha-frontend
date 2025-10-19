import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { log, logError } from '@/lib/log';
import { getStudyRoomById, getRoomPermissions, updateRoomPermissions, ensureRoomPermissions } from '@/lib/devdb';

/**
 * GET /api/rooms/[roomId]/permissions
 * Get current room permissions (requires membership)
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

    const permissions = await ensureRoomPermissions(roomId);

    return NextResponse.json(
      {
        success: true,
        data: {
          askAiEnabled: permissions.askAiEnabled,
          memberAskAi: permissions.memberAskAi,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError('Get permissions error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, code: 'UNAUTHORIZED', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, code: 'INTERNAL_ERROR', message: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rooms/[roomId]/permissions
 * Update room permissions (owner only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireUser();
    const { roomId } = await params;

    log('Update permissions attempt:', { roomId, userId: user.userId });

    // Check room exists
    const room = await getStudyRoomById(roomId);
    if (!room) {
      return NextResponse.json(
        { success: false, code: 'ROOM_NOT_FOUND', message: 'Room not found' },
        { status: 404 }
      );
    }

    // Only owner can update permissions
    if (room.ownerUserId !== user.userId) {
      logError('Non-owner tried to update permissions:', { roomId, userId: user.userId });
      return NextResponse.json(
        { success: false, code: 'NOT_OWNER', message: 'Only room owner can update permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { askAiEnabled, grantUserId, revokeUserId } = body;

    // Validate body
    if (
      askAiEnabled === undefined &&
      !grantUserId &&
      !revokeUserId
    ) {
      return NextResponse.json(
        { success: false, message: 'No updates provided' },
        { status: 400 }
      );
    }

    // If granting/revoking, ensure user is a member
    if (grantUserId && !room.memberUserIds.includes(grantUserId)) {
      return NextResponse.json(
        { success: false, message: 'Cannot grant permission to non-member' },
        { status: 400 }
      );
    }

    const permissions = await updateRoomPermissions(roomId, {
      askAiEnabled,
      grantUserId,
      revokeUserId,
    });

    log('Permissions updated:', { roomId, permissions });

    // TODO: Emit socket event "perm:update" to notify all room members

    return NextResponse.json(
      {
        success: true,
        data: {
          askAiEnabled: permissions.askAiEnabled,
          memberAskAi: permissions.memberAskAi,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError('Update permissions error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, code: 'UNAUTHORIZED', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, code: 'INTERNAL_ERROR', message: 'Failed to update permissions' },
      { status: 500 }
    );
  }
}
