import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { readDB } from '@/lib/devdb';
import { log, logError } from '@/lib/log';

export const dynamic = 'force-dynamic';

/**
 * GET /api/study-rooms/list
 * List all study rooms the authenticated user belongs to
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    log('Listing study rooms for user:', user.userId);

    const db = await readDB();

    // Find all study rooms where user is a member (by userId OR by email)
    // This ensures compatibility when users are in Prisma but study rooms are in devdb
    const userRooms = db.studyRooms
      .filter((room) =>
        room.memberUserIds.includes(user.userId) ||
        room.memberUserIds.some((memberId: string) => {
          const member = db.users.find((u) => u.id === memberId);
          return member && member.email === user.email;
        })
      )
      .map((room) => ({
        id: room.id,
        name: room.name,
        subject: room.subject,
        ownerUserId: room.ownerUserId,
        memberUserIds: room.memberUserIds,
        inviteCode: room.inviteCode,
        createdAt: room.createdAt,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    log('Found study rooms:', userRooms.length);

    return NextResponse.json(
      {
        success: true,
        rooms: userRooms,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError('List study rooms error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, code: 'UNAUTHORIZED', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, code: 'INTERNAL_ERROR', message: 'Failed to list study rooms' },
      { status: 500 }
    );
  }
}
