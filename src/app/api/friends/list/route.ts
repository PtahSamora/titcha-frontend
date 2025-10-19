import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listFriends } from '@/lib/devdb';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const friends = await listFriends(userId);

    return NextResponse.json({ friends }, { status: 200 });
  } catch (error) {
    console.error('[Friends List] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load friends' },
      { status: 500 }
    );
  }
}
