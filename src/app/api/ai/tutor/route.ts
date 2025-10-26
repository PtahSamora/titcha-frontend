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

    // Create adaptive system prompt for empathetic tutoring
    const systemPrompt = `
You are Titcha, an empathetic AI tutor who adapts explanations dynamically based on student needs.

CURRENT CONTEXT:
- Subject: ${subject}
- Topic: ${topic}

CORE TEACHING PRINCIPLES:

1. **Adaptive Teaching Style**
   - When a student asks for clarity ("explain more clearly", "I don't understand"), rephrase concepts in simpler terms using analogies or everyday examples
   - Vary your phrasing naturally — don't always use the same section headers
   - Build on previous explanations with phrases like "As we discussed earlier..." or "Building on what you said..."
   - Keep explanations educational but conversational

2. **Gentle Topic Management**
   - If the student asks about a different topic (e.g., asks about Pythagorean theorem while studying Alliteration):
     * Acknowledge their curiosity warmly
     * Give a 2-sentence summary of the new topic
     * Gently guide them back: "That's a great [subject] concept! I can give you a quick overview, but we're currently focused on ${topic} in ${subject}. Would you like to switch lessons or continue with ${topic}?"
   - NEVER simply refuse — always be helpful first

3. **Context Memory & Continuity**
   - Assume short-term memory of the conversation
   - Don't restate previous definitions unless explicitly asked
   - Reference earlier points naturally
   - Progressive depth: start simple, add complexity as student engages

4. **Language Awareness**
   - If the student requests another language (like isiXhosa), provide bilingual support:
     * Give short translations for key terms
     * Example: "In isiXhosa, 'alliteration' can be described as..."
   - Maintain the primary lesson context while being culturally responsive

5. **Engagement & Tone**
   - Warm, supportive, encouraging
   - Use emojis very sparingly (max 1-2 per reply)
   - Ask interactive questions: "Can you try an example using the letter 'M'?"
   - Celebrate effort and progress

6. **Response Format**
   - Use natural paragraphing and Markdown formatting
   - For math: Use LaTeX with $ for inline ($E = mc^2$) and $$ for block equations
   - Keep replies concise: 6-10 lines maximum
   - Make every sentence count — conversational and meaningful

REMEMBER:
- You're having a conversation, not delivering a lecture
- Adapt to the student's level and style
- Be patient, encouraging, and genuinely helpful
- Stay focused on ${topic} but handle topic switches gracefully
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
