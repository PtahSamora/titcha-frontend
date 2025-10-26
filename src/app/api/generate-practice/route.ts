import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export const dynamic = 'force-dynamic';

interface GeneratePracticeRequest {
  subject: string;
  topic: string;
  numProblems: number;
}

interface PracticeProblem {
  question: string;
  hint: string;
  answer: string;
}

export async function POST(req: Request) {
  try {
    const { subject, topic, numProblems }: GeneratePracticeRequest = await req.json();

    if (!subject || !topic || !numProblems) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, topic, or numProblems' },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are Titcha, an AI tutor generating practice problems for students.

CURRENT CONTEXT:
- Subject: ${subject}
- Topic: ${topic}
- Number of problems: ${numProblems}

TASK:
Generate ${numProblems} practice problems for the topic "${topic}" in ${subject}.

REQUIREMENTS:
1. Each problem should test understanding of ${topic}
2. Problems should range from easy to medium difficulty
3. Include a helpful hint that guides without giving away the answer
4. Provide the correct answer

RESPONSE FORMAT:
Return a JSON array of exactly ${numProblems} problems. Each problem must have:
- question: The problem statement (clear and concise)
- hint: A helpful hint (guides thinking without revealing the answer)
- answer: The correct answer (concise, can be a number, word, or short phrase)

EXAMPLE FORMAT:
[
  {
    "question": "What is 15% of 80?",
    "hint": "Convert the percentage to a decimal and multiply",
    "answer": "12"
  },
  {
    "question": "Solve for x: 2x + 5 = 13",
    "hint": "Subtract 5 from both sides first",
    "answer": "4"
  }
]

IMPORTANT:
- For math problems, provide numerical answers
- For word problems, provide short text answers
- Keep questions at grade-appropriate level
- Make hints genuinely helpful
- Return ONLY the JSON array, no other text
`.trim();

    const userPrompt = `Generate ${numProblems} practice problems for "${topic}" in ${subject}.`;

    console.log('[Generate Practice] Creating problems for:', { subject, topic, numProblems });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message?.content || '{"problems":[]}';

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Generate Practice] JSON parse error:', parseError);
      throw new Error('Failed to parse AI response');
    }

    // Handle different response structures
    let problems: PracticeProblem[] = [];

    if (Array.isArray(parsedResponse)) {
      problems = parsedResponse;
    } else if (parsedResponse.problems && Array.isArray(parsedResponse.problems)) {
      problems = parsedResponse.problems;
    } else {
      throw new Error('Invalid response structure from AI');
    }

    // Validate problems
    const validProblems = problems.filter(
      (p) => p.question && p.hint && p.answer
    ).slice(0, numProblems);

    if (validProblems.length === 0) {
      throw new Error('No valid problems generated');
    }

    console.log('[Generate Practice] Successfully generated', validProblems.length, 'problems');

    return NextResponse.json({
      problems: validProblems,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error('[Generate Practice Error]', error);

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
      { error: error.message || 'Failed to generate practice problems. Please try again.' },
      { status: 500 }
    );
  }
}
