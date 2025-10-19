import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-guards';
import { readDB, writeDB } from '@/lib/devdb';

/**
 * POST /api/student/homework/update
 * Update homework status and score after completion
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('student');

    const body = await request.json();
    const { homeworkId, status, score, completedAt } = body;

    if (!homeworkId) {
      return NextResponse.json({
        success: false,
        message: 'homeworkId is required',
      }, { status: 400 });
    }

    if (status && !['pending', 'completed', 'overdue'].includes(status)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid status. Must be pending, completed, or overdue',
      }, { status: 400 });
    }

    const db = await readDB();

    // Find homework by ID
    const homeworkIndex = db.homework.findIndex(hw => hw.id === homeworkId);

    if (homeworkIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'Homework not found',
      }, { status: 404 });
    }

    const homework = db.homework[homeworkIndex];

    // Verify ownership
    if (homework.studentUserId !== user.userId) {
      return NextResponse.json({
        success: false,
        message: 'Not authorized to update this homework',
      }, { status: 403 });
    }

    // Update homework
    if (status) {
      homework.status = status;
    }

    if (score !== undefined) {
      homework.score = score;
    }

    if (completedAt) {
      homework.completedAt = completedAt;
    } else if (status === 'completed' && !homework.completedAt) {
      homework.completedAt = new Date().toISOString();
    }

    db.homework[homeworkIndex] = homework;
    await writeDB(db);

    return NextResponse.json({
      success: true,
      data: homework,
    }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: error.message }, { status: 403 });
    }
    console.error('[Homework Update API] Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
