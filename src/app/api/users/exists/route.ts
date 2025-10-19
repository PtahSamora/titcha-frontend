import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/devdb';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);

    return NextResponse.json({
      exists: !!user,
    });
  } catch (error) {
    console.error('Check user exists error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
