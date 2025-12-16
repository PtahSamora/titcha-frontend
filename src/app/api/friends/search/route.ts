import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findUserByEmail, findUserById } from '@/lib/devdb';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only students can be searched for friending
    if (user.role !== 'student') {
      return NextResponse.json(
        { error: 'Can only add students as friends' },
        { status: 403 }
      );
    }

    // Get current user to check role
    const currentUser = await findUserById(session.user.id);

    if (currentUser?.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can search for friends' },
        { status: 403 }
      );
    }

    // No school restriction - students from any school can be friends
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Friend Search] Error:', error);
    return NextResponse.json(
      { error: 'Failed to search user' },
      { status: 500 }
    );
  }
}
