import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export const dynamic = 'force-dynamic';

/**
 * Weekly Vibe API Endpoint
 * Generates motivational learning messages based on zodiac personality traits
 * GET /api/horoscope?sign=aries
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sign = searchParams.get('sign');

    if (!sign) {
      return NextResponse.json(
        { error: 'Missing zodiac sign parameter' },
        { status: 400 }
      );
    }

    // Validate zodiac sign
    const validSigns = [
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];

    if (!validSigns.includes(sign.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid zodiac sign' },
        { status: 400 }
      );
    }

    // Try to fetch from Aztro API first
    let baseDescription = '';
    try {
      const url = `https://aztro.sameerkumar.website/?sign=${sign.toLowerCase()}&day=today`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        baseDescription = data.description;
      }
    } catch (fetchError) {
      console.log('[Horoscope] Aztro API unavailable, generating from personality traits');
    }

    // Transform into motivational learning message using AI
    const prompt = `
Rewrite this weekly insight as a short, motivational learning vibe for a student:
"${baseDescription || 'This week brings opportunities for growth and focus.'}"

Requirements:
- Sound like a supportive coach giving personality-based study advice
- 1-2 sentences maximum
- Focus on learning, consistency, and personal growth
- NO mention of zodiac, astrology, or horoscopes
- Make it feel personal and encouraging
- Use words like "focused", "curious", "creative", "determined", "consistent"

Example outputs:
- "You're feeling focused and intuitive this week — a great time to tackle challenging topics and stay consistent with your goals."
- "Your creative energy is high right now. Use it to explore new concepts and make learning fun!"
- "This week calls for determination. Small, steady steps will lead to big progress in your studies."
    `.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a supportive learning coach who provides brief, motivational messages to students.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 100,
    });

    const transformed = completion.choices[0].message?.content?.trim() || '';

    return NextResponse.json({
      description: transformed || 'Stay curious and confident this week — small steps lead to big growth! 🌟',
    });
  } catch (error: any) {
    console.error('[Weekly Vibe Error]', error);

    // Return a fallback motivational message
    const fallbackMessages = [
      'Stay curious and confident this week — small steps lead to big growth! 🌟',
      'This week is perfect for diving into new challenges. Keep your momentum going! 💪',
      'You have great focus energy right now. Use it to master the topics that matter most! 🎯',
      'Your determination shines this week. Consistency will unlock amazing progress! ✨',
    ];

    const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

    return NextResponse.json({
      description: randomMessage,
    });
  }
}
