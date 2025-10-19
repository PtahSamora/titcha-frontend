import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { getRoomSnapshot, saveRoomSnapshot, getStudyRoomById } from '@/lib/devdb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireUser();
    const { roomId } = await params;

    // Verify room exists and user is a member
    const room = await getStudyRoomById(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!room.memberUserIds.includes(user.userId)) {
      return NextResponse.json({ error: 'Not a member of this room' }, { status: 403 });
    }

    const snapshot = await getRoomSnapshot(roomId);

    return NextResponse.json(
      { snapshot: snapshot?.snapshot || null },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Get Room State] Error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to load room state' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireUser();
    const { roomId } = await params;

    // Verify room exists and user is a member
    const room = await getStudyRoomById(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!room.memberUserIds.includes(user.userId)) {
      return NextResponse.json({ error: 'Not a member of this room' }, { status: 403 });
    }

    const body = await request.json();
    const { snapshot } = body;

    if (!snapshot) {
      return NextResponse.json(
        { error: 'Snapshot data is required' },
        { status: 400 }
      );
    }

    await saveRoomSnapshot(roomId, snapshot);

    return NextResponse.json(
      { message: 'Room state saved successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Save Room State] Error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to save room state' },
      { status: 500 }
    );
  }
}
