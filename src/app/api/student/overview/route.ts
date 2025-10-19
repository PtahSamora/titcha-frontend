import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listHomework, readDB } from '@/lib/devdb';

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
    const db = await readDB();

    // Get homework
    const homework = await listHomework(userId);
    const pendingHomework = homework.filter(hw => hw.status === 'pending');
    const overdueHomework = homework.filter(hw => hw.status === 'overdue');

    // Get subjects
    const subjects = db.subjects;

    // Get recent activities
    const recentActivities = db.continueActivities
      .filter(act => act.studentUserId === userId)
      .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
      .slice(0, 5);

    return NextResponse.json(
      {
        subjects,
        homework: {
          total: homework.length,
          pending: pendingHomework.length,
          overdue: overdueHomework.length,
          items: homework.slice(0, 5), // Recent 5
        },
        recentActivities,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Student Overview] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load overview' },
      { status: 500 }
    );
  }
}
