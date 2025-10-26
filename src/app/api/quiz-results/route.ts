import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { getQuizSession, saveQuizResults } from '@/lib/quizStore';

export const dynamic = 'force-dynamic';

interface QuizQuestion {
  topic: string;
  type: 'multiple-choice' | 'open-ended';
  question: string;
  options?: string[];
  correct: string;
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
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }

    // Retrieve quiz session
    const session = getQuizSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Quiz session not found or expired' },
        { status: 404 }
      );
    }

    // Check if results already exist (cached)
    if (session.results) {
      console.log('[Quiz Results] Returning cached results for session:', sessionId);
      return NextResponse.json(session.results);
    }

    // Perform grading
    const { subject, questions, answers } = session;

    const maxScore = questions.length;
    const details: QuestionResult[] = [];
    const openEndedToGrade: Array<{ index: number; question: QuizQuestion; answer: string }> = [];

    // Grade multiple-choice questions directly
    questions.forEach((q: QuizQuestion, index: number) => {
      const studentAnswer = answers[index] || '';

      if (q.type === 'multiple-choice') {
        const isCorrect = studentAnswer.trim().toLowerCase() === q.correct.trim().toLowerCase();
        details.push({
          question: q.question,
          studentAnswer: studentAnswer || '(No answer)',
          correctAnswer: q.correct,
          score: isCorrect ? 1 : 0,
          feedback: isCorrect ? '✓ Correct' : '✗ Incorrect',
        });
      } else {
        openEndedToGrade.push({ index, question: q, answer: studentAnswer });
      }
    });

    // Grade open-ended questions using AI
    if (openEndedToGrade.length > 0) {
      const systemPrompt = `
You are a ${subject} teacher grading quiz answers.

GRADING RUBRIC:
- 1.0 = Fully correct (shows understanding, arrives at correct answer)
- 0.7 = Mostly correct (minor errors but demonstrates understanding)
- 0.5 = Partially correct (some understanding but significant gaps)
- 0.3 = Minimal correctness (attempt made but largely incorrect)
- 0.0 = Incorrect or no answer

EVALUATION CRITERIA:
1. For mathematical problems:
   - Accept algebraically equivalent answers
   - Accept different valid solution methods
   - Award partial credit for correct process with calculation errors

2. For conceptual questions:
   - Evaluate understanding of core concepts
   - Accept answers phrased differently but conveying same meaning
   - Value reasoning and explanation quality

3. General:
   - Be fair and generous with partial credit
   - Recognize correct approaches even with minor mistakes
   - Consider the educational level appropriate to ${subject}

RESPONSE FORMAT:
Return a JSON object with "results" array. Each result must have:
- score: number (0.0 to 1.0)
- feedback: string (brief explanation of grading, 1-2 sentences)

EXAMPLE:
{
  "results": [
    {
      "score": 1.0,
      "feedback": "Excellent work. Your factoring approach is correct and the solutions are accurate."
    },
    {
      "score": 0.7,
      "feedback": "Good understanding shown. Minor arithmetic error in final step, but method is sound."
    }
  ]
}

IMPORTANT: Return ONLY valid JSON. No additional text.
`.trim();

      const questionsToGrade = openEndedToGrade.map((item) => ({
        question: item.question.question,
        correctAnswer: item.question.correct,
        studentAnswer: item.answer || '(No answer provided)',
      }));

      const userPrompt = `Grade these open-ended ${subject} quiz answers:\n\n${JSON.stringify(questionsToGrade, null, 2)}`;

      console.log('[Quiz Results] Grading', openEndedToGrade.length, 'open-ended questions for session:', sessionId);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const responseText = completion.choices[0].message?.content || '{"results":[]}';

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[Quiz Results] JSON parse error:', parseError);
        throw new Error('Failed to parse AI grading response');
      }

      const results = parsedResponse.results || [];

      // Merge AI grading results into details array
      openEndedToGrade.forEach((item, i) => {
        const result = results[i] || { score: 0, feedback: 'Unable to grade' };
        details.push({
          question: item.question.question,
          studentAnswer: item.answer || '(No answer)',
          correctAnswer: item.question.correct,
          score: Math.min(Math.max(result.score, 0), 1),
          feedback: result.feedback,
        });
      });
    }

    // Sort details back to original question order
    const sortedDetails: QuestionResult[] = [];
    questions.forEach((q: QuizQuestion) => {
      const detail = details.find((d) => d.question === q.question);
      if (detail) {
        sortedDetails.push(detail);
      }
    });

    // Calculate total score
    const totalScore = sortedDetails.reduce((sum, d) => sum + d.score, 0);
    const percentage = Math.round((totalScore / maxScore) * 100);

    const finalResults = {
      totalScore: parseFloat(totalScore.toFixed(2)),
      maxScore,
      percentage,
      details: sortedDetails,
    };

    // Cache results
    saveQuizResults(sessionId, finalResults);

    console.log('[Quiz Results] Grading complete for session:', sessionId, { totalScore, maxScore, percentage });

    return NextResponse.json(finalResults);
  } catch (error: any) {
    console.error('[Quiz Results Error]', error);

    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'AI service quota exceeded. Please try again later.' },
        { status: 503 }
      );
    }

    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'AI service configuration error.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to retrieve quiz results. Please try again.' },
      { status: 500 }
    );
  }
}
