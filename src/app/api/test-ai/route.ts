import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function GET() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Say: Titcha backend successfully connected.",
        },
      ],
      max_tokens: 20,
    });

    return NextResponse.json({
      ok: true,
      message: completion.choices[0].message.content,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
