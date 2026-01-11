import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);

    const body = await request.json();
    const { name } = body;

    // Validation
    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: 'Group name must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (name.length > 60) {
      return NextResponse.json(
        { success: false, message: 'Group name must be at most 60 characters' },
        { status: 400 }
      );
    }

    // Get user's school ID from Prisma
    let schoolId: string | null = null;
    try {
      const userData = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { id: true },
      });

      // For now, schoolId can be null - we'll add school relationship later if needed
      schoolId = null;
    } catch (error) {
      console.log('[Group Create] Could not get user from Prisma, proceeding without schoolId');
    }

    // Create group with owner as first member
    const group = await prisma.groupChat.create({
      data: {
        name: name.trim(),
        ownerUserId: user.userId,
        memberUserIds: [user.userId], // Owner is automatically a member
        schoolId,
      },
    });

    return NextResponse.json(
      { success: true, data: group },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Group Create] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create group' },
      { status: 500 }
    );
  }
}
