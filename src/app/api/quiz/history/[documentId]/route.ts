import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { quizAttempts } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { documentId } = await params;

  const history = await getDb()
    .select()
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.documentId, documentId),
        eq(quizAttempts.userId, session.user.id)
      )
    )
    .orderBy(desc(quizAttempts.completedAt))
    .limit(20);

  return NextResponse.json(history);
}
