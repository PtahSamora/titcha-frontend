import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { acceptFriendRequest, findUserById } from '@/lib/devdb';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { friendshipId } = body;

    if (!friendshipId) {
      return NextResponse.json(
        { error: 'Friendship ID is required' },
        { status: 400 }
      );
    }

    console.log('[Accept Friend] User:', user.userId, 'Friendship ID:', friendshipId);

    // Accept the friend request
    const friendship = await acceptFriendRequest(friendshipId);

    // Get the friend user details (the one who sent the request)
    const friendUser = await findUserById(friendship.aUserId);

    console.log('[Accept Friend] Friendship accepted:', friendship);

    return NextResponse.json(
      {
        message: 'Friend request accepted',
        friendship,
        friend: friendUser ? {
          id: friendUser.id,
          email: friendUser.email,
          displayName: friendUser.displayName,
          role: friendUser.role,
        } : null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Accept Friend] Error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to accept friend request' },
      { status: 500 }
    );
  }
}
