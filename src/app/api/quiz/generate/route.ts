import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Keyword } from "@/lib/db/schema";

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_RATIO: Record<Difficulty, number> = {
  easy: 0.2,
  medium: 0.4,
  hard: 0.6,
};

export type Blank = {
  word: string;
  startIndex: number;
  endIndex: number;
};

export type QuizData = {
  documentId: string;
  title: string;
  originalText: string;
  blanks: Blank[];
  difficulty: Difficulty;
};

// 퀴즈 생성 (빈칸 처리)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { documentId, difficulty = "medium" } = body;

  if (!documentId) {
    return NextResponse.json({ error: "문서 ID가 필요합니다." }, { status: 400 });
  }

  const [doc] = await getDb()
    .select()
    .from(documents)
    .where(eq(documents.id, documentId));

  if (!doc) {
    return NextResponse.json({ error: "자료를 찾을 수 없습니다." }, { status: 404 });
  }

  const keywords: Keyword[] = doc.keywords;
  const ratio = DIFFICULTY_RATIO[difficulty as Difficulty] ?? 0.4;
  const blankCount = Math.max(1, Math.round(keywords.length * ratio));

  // 랜덤으로 빈칸 선택
  const shuffled = [...keywords].sort(() => Math.random() - 0.5);
  const blanks: Blank[] = shuffled.slice(0, blankCount).map((kw) => ({
    word: kw.word,
    startIndex: kw.startIndex,
    endIndex: kw.endIndex,
  }));

  // startIndex 순으로 정렬 (텍스트 순서대로)
  blanks.sort((a, b) => a.startIndex - b.startIndex);

  const quizData: QuizData = {
    documentId: doc.id,
    title: doc.title,
    originalText: doc.originalText,
    blanks,
    difficulty: difficulty as Difficulty,
  };

  return NextResponse.json(quizData);
}
