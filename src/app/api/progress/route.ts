import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { calculateSubjectProgress, getAllSubjectsProgress, getSubjectStats } from '@/lib/progressTracking';

export const dynamic = 'force-dynamic';

// GET: Get progress for subjects
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');

    if (subject) {
      // Get progress for specific subject
      const progress = await calculateSubjectProgress(user.userId, subject);
      const stats = await getSubjectStats(user.userId, subject);

      return NextResponse.json({
        subject,
        progress,
        stats,
      });
    } else {
      // Get progress for all subjects
      const allProgress = await getAllSubjectsProgress(user.userId);

      return NextResponse.json({
        subjects: allProgress,
      });
    }
  } catch (error: any) {
    console.error('[Progress GET Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate progress' },
      { status: 500 }
    );
  }
}
