import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { removeMemberFromGroup, findGroupById } from '@/lib/devdb';

export async function POST(
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
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get group and check ownership
    const group = await findGroupById(groupId);
    if (!group) {
      return NextResponse.json(
        { success: false, message: 'Group not found' },
        { status: 404 }
      );
    }

    // Only owner can remove members
    if (group.ownerUserId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Only the group owner can remove members' },
        { status: 403 }
      );
    }

    // Cannot remove the owner
    if (userId === group.ownerUserId) {
      return NextResponse.json(
        { success: false, message: 'Cannot remove the group owner' },
        { status: 400 }
      );
    }

    const updatedGroup = await removeMemberFromGroup(groupId, userId);

    return NextResponse.json(
      { success: true, data: updatedGroup },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Group Remove Member] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
