import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    // Get all groups where user is a member
    const groups = await prisma.groupChat.findMany({
      where: {
        memberUserIds: {
          has: user.userId,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

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
