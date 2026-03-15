import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { quizAttempts } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import type { QuizAnswer } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const { documentId, difficulty, answers } = body;

  if (!documentId || !answers || !Array.isArray(answers)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  // 정답 판정 (완전 일치, 공백/대소문자 무시)
  const gradedAnswers: QuizAnswer[] = answers.map(
    (a: { keyword: string; userAnswer: string }) => ({
      keyword: a.keyword,
      userAnswer: a.userAnswer,
      isCorrect:
        a.userAnswer.trim().toLowerCase() === a.keyword.trim().toLowerCase(),
    })
  );

  const correctCount = gradedAnswers.filter((a) => a.isCorrect).length;

  const [attempt] = await getDb()
    .insert(quizAttempts)
    .values({
      documentId,
      userId: session?.user?.id ?? null,
      difficulty: difficulty || "medium",
      totalBlanks: gradedAnswers.length,
      correctCount,
      answers: gradedAnswers,
    })
    .returning();

  return NextResponse.json(attempt, { status: 201 });
}
