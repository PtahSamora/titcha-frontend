import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { rejectFriendRequest } from '@/lib/devdb';

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

    console.log('[Reject Friend] User:', user.userId, 'Friendship ID:', friendshipId);

    // Reject the friend request
    const friendship = await rejectFriendRequest(friendshipId);

    console.log('[Reject Friend] Friendship rejected:', friendship);

    return NextResponse.json(
      {
        message: 'Friend request rejected',
        friendship,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Reject Friend] Error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to reject friend request' },
      { status: 500 }
    );
  }
}
