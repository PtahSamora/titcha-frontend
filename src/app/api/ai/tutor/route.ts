import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export const dynamic = 'force-dynamic';

interface AITutorRequest {
  subject: string;
  topic: string;
  question: string;
}

export async function POST(req: Request) {
  try {
    const { subject, topic, question }: AITutorRequest = await req.json();

    if (!subject || !topic || !question) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, topic, or question' },
        { status: 400 }
      );
    }

    // Create structured system prompt for educational tutoring
    const systemPrompt = `
You are Titcha, an interactive AI tutor helping a student learn ${subject}.
Always stay focused on ${subject} concepts, even when unrelated questions appear.
If possible, connect the topic ("${topic}") naturally to the question.

Respond in a friendly, structured, and educational way for learners aged 10–18.

When explaining, use clear sections:
1. **Concept Summary** - Brief overview of the main idea
2. **Step-by-Step Explanation** - Break down the concept into simple steps
3. **Example or Real-World Application** - Show how it works in practice
4. **Try It Yourself** - Encourage the student with a practice suggestion

Guidelines:
- Use LaTeX for mathematical equations: \\(a^2 + b^2 = c^2\\) for inline, \\[equation\\] for block
- For science, use simple diagrams descriptions and analogies
- For English, provide examples from literature or writing
- Keep your tone encouraging and conversational, not robotic
- If the question is off-topic, gently redirect: "That's interesting, but let's focus on ${topic} in ${subject}..."
- Use emojis sparingly to make it engaging (max 2-3 per response)
- Keep responses concise but comprehensive (200-400 words)
`.trim();

    const userPrompt = `Topic: ${topic}\n\nQuestion: ${question}`;

    console.log('[AI Tutor] Generating response for:', { subject, topic, question });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const reply = completion.choices[0].message?.content || "Hmm, I'm not sure about that one. Can you rephrase your question?";

    console.log('[AI Tutor] Response generated successfully');

    return NextResponse.json({
      reply,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error('[AI Tutor Error]', error);

    // Return user-friendly error messages
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
      { error: 'AI tutor failed to respond. Please try again.' },
      { status: 500 }
    );
  }
}
