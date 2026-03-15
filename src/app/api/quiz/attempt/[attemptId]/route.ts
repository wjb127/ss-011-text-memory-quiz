import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { quizAttempts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;

  const [attempt] = await getDb()
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.id, attemptId));

  if (!attempt) {
    return NextResponse.json({ error: "결과를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(attempt);
}
