import { NextRequest, NextResponse } from 'next/server';
import { requireUser, requireSameSchool } from '@/lib/auth-guards';
import { findUserByEmail, addFriendship } from '@/lib/devdb';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    const body = await request.json();
    const { friendEmail } = body;

    if (!friendEmail) {
      return NextResponse.json(
        { error: 'Friend email is required' },
        { status: 400 }
      );
    }

    // Find friend by email
    const friendUser = await findUserByEmail(friendEmail);

    if (!friendUser) {
      return NextResponse.json(
        { error: 'User not found with this email' },
        { status: 404 }
      );
    }

    // Prevent adding self
    if (friendUser.id === user.userId) {
      return NextResponse.json(
        { error: 'Cannot add yourself as a friend' },
        { status: 400 }
      );
    }

    // Check if same school
    await requireSameSchool(user.userId, friendUser.id);

    // Add friendship (bidirectional)
    const friendship = await addFriendship(user.userId, friendUser.id);

    return NextResponse.json(
      {
        message: 'Friend added successfully',
        friendship,
        friend: {
          id: friendUser.id,
          email: friendUser.email,
          displayName: friendUser.displayName,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Add Friend] Error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message.includes('same school')) {
      return NextResponse.json({ error: 'Can only add friends from the same school' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to add friend' },
      { status: 500 }
    );
  }
}
