import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listMyGroupChats } from '@/lib/devdb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const groups = await listMyGroupChats(session.user.id);

    return NextResponse.json(
      { success: true, data: groups },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Group List] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load groups' },
      { status: 500 }
    );
  }
}
