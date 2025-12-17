import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { listPendingFriendRequests, listSentFriendRequests } from '@/lib/devdb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'incoming';

    if (type === 'incoming') {
      const requests = await listPendingFriendRequests(user.userId);
      return NextResponse.json({ requests }, { status: 200 });
    } else if (type === 'sent') {
      const requests = await listSentFriendRequests(user.userId);
      return NextResponse.json({ requests }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[Friend Requests] Error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch friend requests' },
      { status: 500 }
    );
  }
}
