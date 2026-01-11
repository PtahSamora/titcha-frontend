import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { requireUser } from '@/lib/auth-guards';
import { getPreviousQuestions, saveGeneratedQuestion, hashQuestion } from '@/lib/devdb';

export const dynamic = 'force-dynamic';

interface GenerateQuizRequest {
  subject: string;
  topics: string[];
  questionsPerTopic: number;
}

interface QuizQuestion {
  topic: string;
  type: 'multiple-choice' | 'open-ended';
  question: string;
  options?: string[];
  correct: string;
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await requireUser(req);
    const { subject, topics, questionsPerTopic = 7 }: GenerateQuizRequest = await req.json();

    if (!subject || !topics || topics.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: subject or topics' },
        { status: 400 }
      );
    }

    // Get previous questions for this user, subject, and topics
    const previousQuestions = await getPreviousQuestions(user.userId, subject, topics);
    console.log(`[Generate Quiz] Found ${previousQuestions.length} previous questions for user ${user.userId}`);


    // Build exclusion list for AI
    const exclusionSection = previousQuestions.length > 0
      ? `\n\nPREVIOUSLY GENERATED QUESTIONS (DO NOT REPEAT):
The student has already seen these questions. Generate COMPLETELY DIFFERENT questions:
${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

CRITICAL:
- Do NOT generate questions similar to the above
- Use DIFFERENT numbers, variables, scenarios, and concepts
- Vary the problem types and approaches
- Ensure questions test the same topics but with fresh examples`
      : '';

    const systemPrompt = `
You are an expert ${subject} teacher creating a comprehensive quiz.

TASK:
Generate a quiz with ${questionsPerTopic} UNIQUE questions for EACH of the following topics: ${topics.join(', ')}${exclusionSection}

QUESTION DISTRIBUTION:
- 60% multiple-choice questions (4 options, exactly one correct)
- 40% open-ended questions (require written explanations or calculations)

REQUIREMENTS:
1. Test understanding and application, not just memorization
2. Multiple-choice questions must have ONE clearly correct answer
3. Distractors should be plausible but incorrect
4. Open-ended questions should require reasoning or problem-solving
5. Questions should vary in difficulty (easy, medium, hard)
6. No hints or explanations in questions
7. ${previousQuestions.length > 0 ? 'MUST be completely different from previously generated questions listed above' : 'Ensure variety in question types'}

RESPONSE FORMAT:
Return a JSON object with a "questions" array. Each question must have:
- topic: string (which topic this question covers)
- type: "multiple-choice" | "open-ended"
- question: string (the question text)
- options: string[] (only for multiple-choice, exactly 4 options)
- correct: string (the correct answer - for MC, must match one option exactly; for open-ended, the model answer)

EXAMPLE:
{
  "questions": [
    {
      "topic": "Quadratic Equations",
      "type": "multiple-choice",
      "question": "What is the vertex of the parabola y = (x - 3)² + 2?",
      "options": ["(3, 2)", "(-3, 2)", "(3, -2)", "(-3, -2)"],
      "correct": "(3, 2)"
    },
    {
      "topic": "Quadratic Equations",
      "type": "open-ended",
      "question": "Solve the equation x² - 5x + 6 = 0 using factoring. Show your work.",
      "correct": "x = 2 or x = 3 (factored as (x-2)(x-3)=0)"
    }
  ]
}

IMPORTANT: Return ONLY valid JSON. No additional text or explanation.
`.trim();

    const userPrompt = `Generate a ${questionsPerTopic}-question quiz for each topic: ${topics.join(', ')} in ${subject}.`;

    console.log('[Generate Quiz] Creating quiz for:', { subject, topics, questionsPerTopic });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message?.content || '{"questions":[]}';

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Generate Quiz] JSON parse error:', parseError);
      throw new Error('Failed to parse AI response');
    }

    // Extract questions array
    const questions: QuizQuestion[] = parsedResponse.questions || [];

    // Validate questions
    const validQuestions = questions.filter(
      (q) => q.topic && q.type && q.question && q.correct
    );

    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated');
    }

    // Ensure multiple-choice questions have exactly 4 options
    validQuestions.forEach((q) => {
      if (q.type === 'multiple-choice') {
        if (!q.options || q.options.length !== 4) {
          console.warn('[Generate Quiz] Invalid options for MC question:', q.question);
        }
      }
    });

    console.log('[Generate Quiz] Successfully generated', validQuestions.length, 'questions');

    // Save generated questions to history
    const savedQuestions = await Promise.all(
      validQuestions.map(async (question) => {
        const questionHash = hashQuestion(question.question);
        return await saveGeneratedQuestion({
          studentUserId: user.userId,
          subject,
          topic: question.topic,
          type: 'quiz',
          questionText: question.question,
          questionHash,
          answer: question.correct,
          options: question.options,
        });
      })
    );

    console.log('[Generate Quiz] Saved', savedQuestions.length, 'questions to history');

    return NextResponse.json({
      questions: validQuestions,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error('[Generate Quiz Error]', error);

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
      { error: error.message || 'Failed to generate quiz. Please try again.' },
      { status: 500 }
    );
  }
}
