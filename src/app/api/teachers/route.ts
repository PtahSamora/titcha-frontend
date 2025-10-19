import { NextRequest, NextResponse } from 'next/server';
import { readDB } from '@/lib/devdb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('schoolId');

    const db = await readDB();

    let teachers = db.teachers;

    if (schoolId) {
      teachers = teachers.filter(t => t.schoolId === schoolId);
    }

    return NextResponse.json({
      teachers,
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
