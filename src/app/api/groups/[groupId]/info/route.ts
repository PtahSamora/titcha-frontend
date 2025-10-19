import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findGroupById, isGroupMember, listRoomMembers } from '@/lib/devdb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { groupId } = await params;

    // Check if user is a member
    const isMember = await isGroupMember(groupId, session.user.id);
    if (!isMember) {
      return NextResponse.json(
        { success: false, message: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    const group = await findGroupById(groupId);
    if (!group) {
      return NextResponse.json(
        { success: false, message: 'Group not found' },
        { status: 404 }
      );
    }

    // Get member details
    const { readDB } = await import('@/lib/devdb');
    const db = await readDB();
    const members = db.users
      .filter(u => group.memberUserIds.includes(u.id))
      .map(u => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
      }));

    return NextResponse.json(
      {
        success: true,
        data: {
          group,
          members,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Group Info] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load group info' },
      { status: 500 }
    );
  }
}
