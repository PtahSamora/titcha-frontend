import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { readDB, writeDB, findUserByEmail } from '@/lib/devdb';
import { registerStudentSchema } from '@/lib/validation';
import { uuid, generateId } from '@/lib/ids';
import type { User, StudentProfile } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerStudentSchema.safeParse(body);
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
      role: 'student',
      email: data.email,
      passwordHash,
      displayName: data.fullName,
      schoolId: data.schoolId,
      meta: {
        grade: data.grade,
        theme: data.theme || 'student',
        colors: data.colors,
      },
      createdAt: now,
      updatedAt: now,
    };

    // Create student profile
    const studentProfile: StudentProfile = {
      id: generateId('student'),
      userId,
      schoolId: data.schoolId,
      grade: data.grade,
      fullName: data.fullName,
    };

    // Update database
    db.users.push(newUser);
    db.students.push(studentProfile);
    await writeDB(db);

    // Return safe user data (no password hash)
    const { passwordHash: _, ...safeUser } = newUser;

    return NextResponse.json(
      {
        message: 'Student registered successfully',
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Student registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
