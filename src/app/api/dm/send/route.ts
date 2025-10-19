import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { checkRateLimit } from '@/lib/ratelimit';
import { addDM } from '@/lib/devdb';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    // Rate limiting: 10 messages per 10 seconds
    const rateLimitKey = `dm:${user.userId}`;
    if (!checkRateLimit(rateLimitKey, 10, 10000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please slow down.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { toUserId, message } = body;

    if (!toUserId || !message) {
      return NextResponse.json(
        { error: 'toUserId and message are required' },
        { status: 400 }
      );
    }

    if (!message.trim() || message.length > 2000) {
      return NextResponse.json(
        { error: 'Message must be between 1 and 2000 characters' },
        { status: 400 }
      );
    }

    // Save DM to database
    const dm = await addDM(user.userId, toUserId, message.trim());

    return NextResponse.json({ dm }, { status: 200 });
  } catch (error: any) {
    console.error('[DM Send] Error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
