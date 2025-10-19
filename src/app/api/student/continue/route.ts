import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-guards';
import { readDB, writeDB } from '@/lib/devdb';

interface ContinueActivity {
  id: string;
  studentUserId: string;
  type: 'lesson' | 'homework' | 'practice';
  subject: string;
  title: string;
  url: string;
  progress: number;
  lastAccessed: string;
}

/**
 * GET /api/student/continue
 * Returns recent activities for resume/continue functionality
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole('student');

    const db = await readDB();
    const activities = db.continueActivities
      .filter(act => act.studentUserId === user.userId)
      .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
      .slice(0, 5); // Return top 5 most recent

    return NextResponse.json({
      success: true,
      data: activities,
    }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: error.message }, { status: 403 });
    }
    console.error('[Continue API] Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/student/continue
 * Update or create a continue activity
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('student');
    const body = await request.json();

    const { type, subject, title, url, progress } = body;

    if (!type || !subject || !title || !url) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: type, subject, title, url',
      }, { status: 400 });
    }

    if (!['lesson', 'homework', 'practice'].includes(type)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid type. Must be lesson, homework, or practice',
      }, { status: 400 });
    }

    const db = await readDB();

    // Find existing activity by URL
    const existingIndex = db.continueActivities.findIndex(
      act => act.studentUserId === user.userId && act.url === url
    );

    const activity: ContinueActivity = {
      id: existingIndex >= 0 ? db.continueActivities[existingIndex].id : `act-${Date.now()}`,
      studentUserId: user.userId,
      type,
      subject,
      title,
      url,
      progress: progress ?? 0,
      lastAccessed: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Update existing
      db.continueActivities[existingIndex] = activity;
    } else {
      // Create new
      db.continueActivities.push(activity);
    }

    await writeDB(db);

    return NextResponse.json({
      success: true,
      data: activity,
    }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: error.message }, { status: 403 });
    }
    console.error('[Continue API] Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
