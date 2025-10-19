import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { readDB, writeDB, findUserByEmail } from '@/lib/devdb';
import { registerParentSchema } from '@/lib/validation';
import { uuid, generateId } from '@/lib/ids';
import type { User, ParentProfile } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerParentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if user already exists
    const existingUser = await findUserByEmail(data.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const db = await readDB();

    // Hash password
    const passwordHash = await hash(data.password, 10);

    // Create user
    const userId = uuid();
    const now = new Date().toISOString();

    const newUser: User = {
      id: userId,
      role: 'parent',
      email: data.email,
      passwordHash,
      displayName: data.fullName,
      schoolId: data.schoolId,
      meta: {
        theme: 'parent',
        childIds: [],
      },
      createdAt: now,
      updatedAt: now,
    };

    // Create parent profile
    const parentProfile: ParentProfile = {
      id: generateId('parent'),
      userId,
      schoolId: data.schoolId,
      fullName: data.fullName,
      childUserIds: [],
    };

    // Update database
    db.users.push(newUser);
    db.parents.push(parentProfile);
    await writeDB(db);

    // Return safe user data
    const { passwordHash: _, ...safeUser } = newUser;

    return NextResponse.json(
      {
        message: 'Parent registered successfully',
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Parent registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
