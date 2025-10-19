import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, prompt, topic, type } = body;

    // Mock AI tutor response with lesson blocks
    // In production, this would call the AI Core microservice

    if (type === 'lesson') {
      // Initial lesson start
      const blocks = [
        {
          type: 'text',
          content: `Welcome to your ${subject} lesson on ${topic}!`,
        },
        {
          type: 'text',
          content: `Let's start by understanding the fundamentals.`,
        },
        {
          type: 'math',
          latex: subject === 'Mathematics'
            ? '\\int_0^1 x^2 dx = \\frac{1}{3}'
            : 'E = mc^2',
        },
        {
          type: 'point',
          x: 100,
          y: 150,
          content: 'Key concept: Start here',
        },
        {
          type: 'text',
          content: 'This is an important foundation for understanding more advanced concepts.',
        },
      ];

      return NextResponse.json({ blocks }, { status: 200 });
    }

    if (type === 'question') {
      // Student asked a question
      const blocks = [
        {
          type: 'text',
          content: `Great question! Let me explain...`,
        },
        {
          type: 'text',
          content: `Here's how we can think about: "${prompt}"`,
        },
        {
          type: 'math',
          latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n',
        },
        {
          type: 'point',
          x: 200,
          y: 250,
          content: 'Notice this pattern',
        },
      ];

      return NextResponse.json({ blocks }, { status: 200 });
    }

    if (type === 'checkpoint') {
      // Load checkpoint questions
      const questions = [
        {
          id: 'q1',
          question: `What is the main concept we covered in ${topic}?`,
          options: [
            'The fundamental theorem',
            'Basic definitions',
            'Advanced applications',
            'Historical context',
          ],
          correctIndex: 0,
          explanation: 'The fundamental theorem is the core concept we explored.',
        },
        {
          id: 'q2',
          question: 'Which formula represents the key equation?',
          options: [
            'E = mc^2',
            '∫ x^2 dx = x^3/3 + C',
            'a^2 + b^2 = c^2',
            'F = ma',
          ],
          correctIndex: 1,
          explanation: 'This is the integration formula we derived.',
        },
        {
          id: 'q3',
          question: `In ${subject}, this principle is used to...`,
          options: [
            'Solve complex problems',
            'Understand relationships',
            'Build foundations',
            'All of the above',
          ],
          correctIndex: 3,
          explanation: 'This principle has multiple applications across the subject.',
        },
      ];

      return NextResponse.json({ questions }, { status: 200 });
    }

    // Default response
    return NextResponse.json(
      { error: 'Invalid request type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Tutor API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
