import { NextResponse } from 'next/server';
import { readDB } from '@/lib/devdb';

export async function GET() {
  try {
    const db = await readDB();

    return NextResponse.json({
      schools: db.schools,
    });
  } catch (error) {
    console.error('Get schools error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
