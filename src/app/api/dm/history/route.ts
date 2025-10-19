import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listDMs } from '@/lib/devdb';

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

    const url = new URL(request.url);
    const friendId = url.searchParams.get('friendId');

    if (!friendId) {
      return NextResponse.json(
        { error: 'friendId is required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const messages = await listDMs(userId, friendId);

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('[DM History] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load message history' },
      { status: 500 }
    );
  }
}
