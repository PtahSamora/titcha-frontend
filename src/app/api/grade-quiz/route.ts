import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { generateSessionId, saveQuizSession } from '@/lib/quizStore';

export const dynamic = 'force-dynamic';

interface QuizQuestion {
  topic: string;
  type: 'multiple-choice' | 'open-ended';
  question: string;
  options?: string[];
  correct: string;
}

interface GradeQuizRequest {
  subject: string;
  questions: QuizQuestion[];
  answers: (string | null)[];
  elapsedTime?: number;
}

interface QuestionResult {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  score: number;
  feedback: string;
}

export async function POST(req: Request) {
  try {
    const { subject, questions, answers, elapsedTime = 0 }: GradeQuizRequest = await req.json();

    if (!subject || !questions || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, questions, or answers' },
        { status: 400 }
      );
    }

    // Generate session ID and save quiz for deferred grading
    const sessionId = generateSessionId();
    saveQuizSession(sessionId, {
      subject,
      questions,
      answers,
      elapsedTime,
      timestamp: Date.now(),
    });

    console.log('[Grade Quiz] Quiz submitted for deferred grading:', { sessionId, subject, elapsedTime });

    // Return session ID immediately (grading happens later via /api/quiz-results)
    return NextResponse.json({
      sessionId,
      message: 'Quiz submitted successfully. Results will be available in 15 minutes.',
    });
  } catch (error: any) {
    console.error('[Grade Quiz Error]', error);

    return NextResponse.json(
      { error: error.message || 'Failed to submit quiz. Please try again.' },
      { status: 500 }
    );
  }
}
