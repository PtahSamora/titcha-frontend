import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Retrieve active quiz session
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get specific session by ID
      const session = await prisma.quizSession.findUnique({
        where: { id: sessionId },
      });

      if (session && session.studentUserId !== user.userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      return NextResponse.json({ session });
    }

    if (!subject) {
      return NextResponse.json(
        { error: 'Missing subject' },
        { status: 400 }
      );
    }

    // Find most recent incomplete session for this subject
    const session = await prisma.quizSession.findFirst({
      where: {
        studentUserId: user.userId,
        subject,
        submitted: false,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('[Quiz Session GET Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}

// POST: Save/update quiz session
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const {
      sessionId,
      subject,
      topics,
      questions,
      answers,
      elapsedTime,
      submitted,
      graded,
      results,
    } = body;

    if (!subject || !topics || !questions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let session;

    if (sessionId) {
      // Update existing session
      const updateData: any = {
        answers: answers || [],
        elapsedTime: elapsedTime || 0,
        updatedAt: new Date(),
      };

      if (submitted !== undefined) {
        updateData.submitted = submitted;
      }

      if (graded && results) {
        updateData.graded = true;
        updateData.results = results;
        updateData.totalScore = results.totalScore;
        updateData.maxScore = results.maxScore;
        updateData.percentage = results.percentage;
        updateData.completedAt = new Date();
      }

      session = await prisma.quizSession.update({
        where: { id: sessionId },
        data: updateData,
      });
    } else {
      // Create new session
      session = await prisma.quizSession.create({
        data: {
          studentUserId: user.userId,
          subject,
          topics,
          questions,
          answers: answers || [],
          elapsedTime: elapsedTime || 0,
          submitted: submitted || false,
          graded: graded || false,
          results: results || null,
          totalScore: results?.totalScore,
          maxScore: results?.maxScore,
          percentage: results?.percentage,
        },
      });
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('[Quiz Session POST Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save session' },
      { status: 500 }
    );
  }
}
