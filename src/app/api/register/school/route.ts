import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { readDB, writeDB, findUserByEmail } from '@/lib/devdb';
import { registerSchoolSchema } from '@/lib/validation';
import { uuid, generateId } from '@/lib/ids';
import type { User, School } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerSchoolSchema.safeParse(body);
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

    // Create school entity
    const schoolId = generateId('school');
    const school: School = {
      id: schoolId,
      name: data.schoolName,
      region: data.region,
      colors: data.colors,
    };

    // Create school admin user
    const userId = uuid();
    const now = new Date().toISOString();

    const newUser: User = {
      id: userId,
      role: 'school',
      email: data.email,
      passwordHash,
      displayName: data.adminName,
      schoolId,
      meta: {
        theme: 'school',
        colors: data.colors,
      },
      createdAt: now,
      updatedAt: now,
    };

    // Update database
    db.schools.push(school);
    db.users.push(newUser);
    await writeDB(db);

    // Return safe user data
    const { passwordHash: _, ...safeUser } = newUser;

    return NextResponse.json(
      {
        message: 'School registered successfully',
        user: safeUser,
        school,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('School registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
