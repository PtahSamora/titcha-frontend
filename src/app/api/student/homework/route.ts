import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listHomework, updateHomeworkStatus } from '@/lib/devdb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const homework = await listHomework(userId);

    // Update overdue status
    const now = new Date();
    const updatedHomework = homework.map(hw => {
      if (hw.status === 'pending' && new Date(hw.dueDate) < now) {
        return { ...hw, status: 'overdue' as const };
      }
      return hw;
    });

    return NextResponse.json({ homework: updatedHomework }, { status: 200 });
  } catch (error) {
    console.error('[Homework] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load homework' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      );
    }

    const homework = await updateHomeworkStatus(id, status);

    if (!homework) {
      return NextResponse.json(
        { error: 'Homework not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ homework }, { status: 200 });
  } catch (error) {
    console.error('[Homework Update] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update homework' },
      { status: 500 }
    );
  }
}
