import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    return NextResponse.json({
      hasSession: !!session,
      session: session ? {
        user: {
          id: (session.user as any)?.id,
          email: session.user?.email,
          name: session.user?.name,
          role: (session.user as any)?.role,
        },
      } : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      hasSession: false,
    }, { status: 500 });
  }
}
