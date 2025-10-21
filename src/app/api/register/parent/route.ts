import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerParentSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerParentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Try Prisma first if DATABASE_URL is configured
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('xxxxx')) {
      try {
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

        // Hash password with bcrypt (10 salt rounds)
        const passwordHash = await hash(data.password, 10);

        // Create user in Prisma with uppercase role
        const user = await prisma.user.create({
          data: {
            name: data.fullName,
            email: data.email,
            password: passwordHash,
            role: 'PARENT', // Uppercase for Prisma schema
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
            success: true,
            message: 'Parent registered successfully',
            user: {
              id: user.id,
              email: user.email,
              role: user.role.toLowerCase(),
              displayName: user.name,
            },
          },
          { status: 201 }
        );
      } catch (error: any) {
        console.error('Prisma registration error:', error);

        // Handle Prisma-specific errors
        if (error.code === 'P2002') {
          return NextResponse.json(
            { error: 'Email already in use' },
            { status: 400 }
          );
        }

        // If it's a connection error, fall back to devdb
        if (error.message?.includes("Can't reach database")) {
          console.log('Database unreachable, falling back to devdb');
          // Fall through to devdb registration below
        } else {
          // For other errors, return immediately
          return NextResponse.json(
            { error: 'Registration failed', message: error.message },
            { status: 500 }
          );
        }
      }
    }

    // Fallback to devdb (for local development when database is unreachable)
    const { createUser, findUserByEmail } = await import('@/lib/devdb');

    const existingDevUser = await findUserByEmail(data.email);
    if (existingDevUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hash(data.password, 10);

    const devUser = await createUser({
      email: data.email,
      passwordHash,
      displayName: data.fullName,
      role: 'parent', // lowercase for devdb
      meta: {},
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Parent registered successfully',
        user: {
          id: devUser.id,
          email: devUser.email,
          role: devUser.role,
          displayName: devUser.displayName,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Parent registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', message: error.message },
      { status: 500 }
    );
  }
}
