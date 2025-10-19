import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createGroupChat, findUserById } from '@/lib/devdb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    // Validation
    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: 'Group name must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (name.length > 60) {
      return NextResponse.json(
        { success: false, message: 'Group name must be at most 60 characters' },
        { status: 400 }
      );
    }

    // Get user's school ID for same-school enforcement
    const user = await findUserById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const group = await createGroupChat({
      name: name.trim(),
      ownerUserId: session.user.id,
      schoolId: user.schoolId,
    });

    return NextResponse.json(
      { success: true, data: group },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Group Create] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create group' },
      { status: 500 }
    );
  }
}
