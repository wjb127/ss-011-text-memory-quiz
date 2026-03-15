import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { extractKeywords } from "@/lib/claude";
import { eq, desc } from "drizzle-orm";

// 자료 목록 조회
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const docs = await getDb()
    .select({
      id: documents.id,
      title: documents.title,
      sourceType: documents.sourceType,
      keywordCount: documents.keywords,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.userId, session.user.id))
    .orderBy(desc(documents.createdAt));

  // keywordCount를 실제 개수로 변환
  const result = docs.map((doc) => ({
    ...doc,
    keywordCount: Array.isArray(doc.keywordCount) ? doc.keywordCount.length : 0,
  }));

  return NextResponse.json(result);
}

// 자료 생성
export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const { title, text } = body;

  if (!text || text.trim().length === 0) {
    return NextResponse.json({ error: "텍스트를 입력해주세요." }, { status: 400 });
  }

  if (text.length > 10000) {
    return NextResponse.json(
      { error: "텍스트는 10,000자까지 입력 가능합니다." },
      { status: 400 }
    );
  }

  // AI 키워드 추출
  const keywords = await extractKeywords(text);

  if (keywords.length === 0) {
    return NextResponse.json(
      { error: "키워드를 추출할 수 없습니다. 더 긴 텍스트를 입력해주세요." },
      { status: 400 }
    );
  }

  const [doc] = await getDb()
    .insert(documents)
    .values({
      userId: session?.user?.id ?? null,
      title: title || text.substring(0, 50) + (text.length > 50 ? "..." : ""),
      originalText: text,
      keywords,
      sourceType: "text",
    })
    .returning();

  return NextResponse.json(doc, { status: 201 });
}
