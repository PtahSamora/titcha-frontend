import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export const dynamic = 'force-dynamic';

interface AISubjectRequest {
  subject: string;
  topic: string;
  question: string;
}

interface AIResponse {
  structure: 'explanation' | 'example' | 'practice' | 'definition' | 'tip';
  text: string;
}

export async function POST(req: Request) {
  try {
    const { subject, topic, question }: AISubjectRequest = await req.json();

    if (!subject || !topic || !question) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, topic, or question' },
        { status: 400 }
      );
    }

    // Create subject-specific system prompt
    const systemPrompt = `
You are Titcha, a friendly and structured AI tutor helping a student learn ${subject}.

CONTEXT:
- Subject: ${subject}
- Current Topic: ${topic}

YOUR ROLE:
- Keep explanations clear, engaging, and age-appropriate
- Always provide step-by-step explanations with examples from ${subject}
- For math questions, use LaTeX formatting: use a² + b² = c² notation (not \\(...\\))
- If a question seems unrelated to ${subject}, gently redirect and connect it back to the current topic
- Be encouraging and patient

RESPONSE FORMAT:
First, determine the best response type:
- "explanation" - Teaching core concepts
- "example" - Providing worked-out examples
- "practice" - Offering problems to solve
- "definition" - Explaining terminology
- "tip" - Giving helpful advice

Then provide your response in this exact JSON format:
{
  "structure": "one of: explanation, example, practice, definition, tip",
  "text": "your complete response here"
}

IMPORTANT:
- For mathematical expressions, use simple text formatting: a² + b² = c², √(x), x², etc.
- Keep responses concise (2-3 paragraphs maximum)
- Always relate answers back to "${topic}" in ${subject}
- Be warm and encouraging
`.trim();

    const userPrompt = `Topic: ${topic}\n\nQuestion: ${question}`;

    console.log('[AI Subject] Generating response for:', { subject, topic, question });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const rawResponse = completion.choices[0].message?.content || '{}';

    try {
      const parsedResponse: AIResponse = JSON.parse(rawResponse);

      // Validate the response structure
      if (!parsedResponse.structure || !parsedResponse.text) {
        throw new Error('Invalid response format from AI');
      }

      console.log('[AI Subject] Response generated:', parsedResponse.structure);

      return NextResponse.json({
        response: parsedResponse,
        usage: completion.usage,
      });
    } catch (parseError) {
      console.error('[AI Subject] Failed to parse AI response:', rawResponse);

      // Fallback to a structured response
      return NextResponse.json({
        response: {
          structure: 'explanation',
          text: rawResponse,
        },
      });
    }

  } catch (error: any) {
    console.error('[AI Subject Error]', error);

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
      { error: 'AI Tutor failed to respond. Please try again.' },
      { status: 500 }
    );
  }
}
