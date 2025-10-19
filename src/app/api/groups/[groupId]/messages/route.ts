import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { checkRateLimit } from '@/lib/ratelimit';
import { addGroupMessage, listGroupMessages, isGroupMember } from '@/lib/devdb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await requireUser();
    const { groupId } = await params;

    // Check if user is a member of the group
    const isMember = await isGroupMember(groupId, user.userId);
    if (!isMember) {
      return NextResponse.json(
        { success: false, message: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const before = url.searchParams.get('before') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const messages = await listGroupMessages(groupId, limit, before);

    return NextResponse.json(
      { success: true, data: messages },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Group Messages GET] Error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { success: false, message: 'Failed to load messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await requireUser();
    const { groupId } = await params;

    // Rate limiting: 10 messages per 10 seconds
    const rateLimitKey = `group:${user.userId}:${groupId}`;
    if (!checkRateLimit(rateLimitKey, 10, 10000)) {
      return NextResponse.json(
        { success: false, message: 'Rate limit exceeded. Please slow down.' },
        { status: 429 }
      );
    }

    // Check if user is a member of the group
    const isMember = await isGroupMember(groupId, user.userId);
    if (!isMember) {
      return NextResponse.json(
        { success: false, message: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, message: 'Message must be at most 2000 characters' },
        { status: 400 }
      );
    }

    const newMessage = await addGroupMessage(groupId, user.userId, message.trim());

    return NextResponse.json(
      { success: true, data: newMessage },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Group Messages POST] Error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}
