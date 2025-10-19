import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Mock OCR response
    // In production, this would call the AI Core OCR service

    // Simulate different responses based on image name/type for testing
    const blocks = [
      {
        type: 'text',
        content: 'I detected a mathematical expression in your image.',
      },
      {
        type: 'math',
        latex: 'x^2 + 5x + 6 = 0',
      },
      {
        type: 'text',
        content: 'This is a quadratic equation. Let me solve it for you:',
      },
      {
        type: 'math',
        latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
      },
      {
        type: 'text',
        content: 'Substituting the values: a=1, b=5, c=6',
      },
      {
        type: 'math',
        latex: 'x = \\frac{-5 \\pm \\sqrt{25 - 24}}{2} = \\frac{-5 \\pm 1}{2}',
      },
      {
        type: 'text',
        content: 'Therefore, the solutions are:',
      },
      {
        type: 'math',
        latex: 'x_1 = -2 \\text{ or } x_2 = -3',
      },
      {
        type: 'point',
        x: 150,
        y: 200,
        content: 'These are the two roots',
      },
      {
        type: 'text',
        content: 'We can verify: (-2)² + 5(-2) + 6 = 4 - 10 + 6 = 0 ✓',
      },
    ];

    return NextResponse.json({ blocks }, { status: 200 });
  } catch (error) {
    console.error('[OCR API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
