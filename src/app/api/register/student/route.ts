import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerStudentSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerStudentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if DATABASE_URL is properly configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('xxxxx')) {
      return NextResponse.json(
        {
          error: 'Database not configured',
          message: 'Please configure DATABASE_URL in environment variables',
        },
        { status: 503 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(data.password, 10);

    // Create user in Prisma with uppercase role
    const user = await prisma.user.create({
      data: {
        name: data.fullName,
        email: data.email,
        password: passwordHash,
        role: 'STUDENT', // Uppercase for Prisma schema
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Student registered successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role.toLowerCase(), // Return lowercase for frontend compatibility
          displayName: user.name,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Student registration error:', error);

    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
