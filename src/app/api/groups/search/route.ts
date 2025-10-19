import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findGroupByName } from '@/lib/devdb';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';

    const groups = await findGroupByName(session.user.id, query);

    return NextResponse.json(
      { success: true, data: groups },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Group Search] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to search groups' },
      { status: 500 }
    );
  }
}
