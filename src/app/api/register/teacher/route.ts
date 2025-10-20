import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { readDB, writeDB, findUserByEmail } from '@/lib/devdb';
import { registerTeacherSchema } from '@/lib/validation';
import { uuid, generateId } from '@/lib/ids';
import type { User, Teacher } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerTeacherSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
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
      role: 'teacher',
      email: data.email,
      passwordHash,
      displayName: data.fullName,
      schoolId: data.schoolId,
      meta: {
        teacherSubjects: data.subjects,
        theme: data.theme || 'teacher',
        colors: data.colors,
      },
      createdAt: now,
      updatedAt: now,
    };

    // Create teacher profile
    const teacher: Teacher = {
      id: generateId('teacher'),
      schoolId: data.schoolId,
      name: data.fullName,
      subjects: data.subjects,
    };

    // Update database
    db.users.push(newUser);
    db.teachers.push(teacher);
    await writeDB(db);

    // Return safe user data
    const { passwordHash: _, ...safeUser } = newUser;

    return NextResponse.json(
      {
        message: 'Teacher registered successfully',
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Teacher registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
