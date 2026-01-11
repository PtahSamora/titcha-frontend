import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Retrieve active practice session
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const topic = searchParams.get('topic');

    if (!subject || !topic) {
      return NextResponse.json(
        { error: 'Missing subject or topic' },
        { status: 400 }
      );
    }

    // Find most recent incomplete session for this topic
    const session = await prisma.practiceSession.findFirst({
      where: {
        studentUserId: user.userId,
        subject,
        topic,
        completed: false,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('[Practice Session GET Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}

// POST: Save/update practice session
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const {
      sessionId,
      subject,
      topic,
      problems,
      answers,
      feedback,
      isCorrect,
      showHint,
      completed,
    } = body;

    if (!subject || !topic || !problems) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const score = isCorrect ? isCorrect.filter((c: boolean) => c).length : 0;
    const totalProblems = problems.length;

    let session;

    if (sessionId) {
      // Update existing session
      session = await prisma.practiceSession.update({
        where: { id: sessionId },
        data: {
          answers,
          feedback,
          isCorrect,
          showHint,
          completed: completed || false,
          score,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new session
      session = await prisma.practiceSession.create({
        data: {
          studentUserId: user.userId,
          subject,
          topic,
          problems,
          answers: answers || [],
          feedback: feedback || [],
          isCorrect: isCorrect || [],
          showHint: showHint || [],
          completed: completed || false,
          score,
          totalProblems,
        },
      });
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('[Practice Session POST Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save session' },
      { status: 500 }
    );
  }
}
