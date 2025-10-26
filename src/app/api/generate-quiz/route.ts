import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

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

export async function POST(req: Request) {
  try {
    const { subject, topics, questionsPerTopic = 7 }: GenerateQuizRequest = await req.json();

    if (!subject || !topics || topics.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: subject or topics' },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are an expert ${subject} teacher creating a comprehensive quiz.

TASK:
Generate a quiz with ${questionsPerTopic} questions for EACH of the following topics: ${topics.join(', ')}

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
