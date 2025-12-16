import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
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
    console.log('[Add Friend] Searching for user:', friendEmail);
    const friendUser = await findUserByEmail(friendEmail);
    console.log('[Add Friend] Search result:', friendUser ? `Found: ${friendUser.email} (${friendUser.role})` : 'Not found');

    if (!friendUser) {
      return NextResponse.json(
        { error: 'User not found with this email' },
        { status: 404 }
      );
    }

    // Only students can add friends, and they can only add other students
    // Case-insensitive role check (Supabase uses "STUDENT", devdb uses "student")
    console.log('[Add Friend] Current user role:', user.role);
    console.log('[Add Friend] Friend user role:', friendUser.role);

    if (user.role.toLowerCase() !== 'student') {
      console.log('[Add Friend] Rejected: Current user is not a student');
      return NextResponse.json(
        { error: 'Only students can add friends' },
        { status: 403 }
      );
    }

    if (friendUser.role.toLowerCase() !== 'student') {
      console.log('[Add Friend] Rejected: Friend is not a student');
      return NextResponse.json(
        { error: 'Can only add students as friends' },
        { status: 403 }
      );
    }

    // Prevent adding self
    if (friendUser.id === user.userId) {
      return NextResponse.json(
        { error: 'Cannot add yourself as a friend' },
        { status: 400 }
      );
    }

    // Add friendship (bidirectional) - no school restriction
    const friendship = await addFriendship(user.userId, friendUser.id);

    return NextResponse.json(
      {
        message: 'Friend added successfully',
        friendship,
        friend: {
          id: friendUser.id,
          email: friendUser.email,
          displayName: friendUser.displayName,
          role: friendUser.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Add Friend] Error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to add friend' },
      { status: 500 }
    );
  }
}
