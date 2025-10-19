import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Quick sanity check query to test database connection
    const now = await prisma.$queryRaw`SELECT NOW()`;
    return NextResponse.json({ status: "ok", time: now });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
