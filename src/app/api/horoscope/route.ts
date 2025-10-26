import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Horoscope API Endpoint
 * Fetches daily horoscope from Aztro API
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

    // Fetch from Aztro API (free horoscope API)
    const url = `https://aztro.sameerkumar.website/?sign=${sign.toLowerCase()}&day=today`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch horoscope from external API');
    }

    const data = await response.json();

    return NextResponse.json({
      description: data.description || 'Your stars are aligned for a great week ahead!',
      compatibility: data.compatibility,
      mood: data.mood,
      color: data.color,
      luckyNumber: data.lucky_number,
      luckyTime: data.lucky_time,
    });
  } catch (error: any) {
    console.error('[Horoscope Error]', error);

    // Return a fallback horoscope message
    return NextResponse.json({
      description: 'The stars suggest focusing on your goals this week. Stay positive and embrace new learning opportunities!',
    });
  }
}
