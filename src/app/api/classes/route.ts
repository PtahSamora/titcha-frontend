import { NextRequest, NextResponse } from 'next/server';
import { readDB } from '@/lib/devdb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('schoolId');

    const db = await readDB();

    let classes = db.classes;

    if (schoolId) {
      classes = classes.filter(c => c.schoolId === schoolId);
    }

    return NextResponse.json({
      classes,
    });
  } catch (error) {
    console.error('Get classes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
