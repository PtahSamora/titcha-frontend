import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addMemberToGroup, findGroupById, findUserByEmail, findUserById, isGroupMember } from '@/lib/devdb';

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
    const { userEmail } = body;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: 'User email is required' },
        { status: 400 }
      );
    }

    // Check if requesting user is a member of the group
    const isMember = await isGroupMember(groupId, session.user.id);
    if (!isMember) {
      return NextResponse.json(
        { success: false, message: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Find the user to add
    const userToAdd = await findUserByEmail(userEmail);
    if (!userToAdd) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get group and check same-school requirement
    const group = await findGroupById(groupId);
    if (!group) {
      return NextResponse.json(
        { success: false, message: 'Group not found' },
        { status: 404 }
      );
    }

    // Enforce same-school
    if (group.schoolId && userToAdd.schoolId !== group.schoolId) {
      return NextResponse.json(
        { success: false, message: 'User must be from the same school' },
        { status: 403 }
      );
    }

    const updatedGroup = await addMemberToGroup(groupId, userToAdd.id);

    return NextResponse.json(
      { success: true, data: updatedGroup },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Group Add Member] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add member' },
      { status: 500 }
    );
  }
}
