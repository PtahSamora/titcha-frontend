import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/devdb';
import { contactSchema } from '@/lib/validation';
import { uuid } from '@/lib/ids';
import type { ContactMessage } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Save to database
    const db = await readDB();

    const contactMessage: ContactMessage = {
      id: uuid(),
      name: data.name,
      email: data.email,
      subject: data.subject || '',
      message: data.message,
      createdAt: new Date().toISOString(),
    };

    db.contactMessages.push(contactMessage);
    await writeDB(db);

    console.log('Contact form submission saved:', contactMessage);

    return NextResponse.json(
      {
        message: 'Thank you for contacting us. We will get back to you soon!',
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
