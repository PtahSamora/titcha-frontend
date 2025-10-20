import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Diagnostic endpoint to check environment configuration
// Remove this in production!
export async function GET() {
  try {
    const envStatus = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_URL_format: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.substring(0, 30) + '...'
        : 'NOT SET',
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV || 'NOT SET',
    };

    // Try to check if Prisma Client is available
    let prismaStatus = 'unknown';
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.$connect();
      prismaStatus = 'connected';
      await prisma.$disconnect();
    } catch (error: any) {
      prismaStatus = error.message || 'error';
    }

    return NextResponse.json({
      status: 'ok',
      environment: envStatus,
      prisma: prismaStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
