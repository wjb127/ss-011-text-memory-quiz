"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

type Blank = {
  word: string;
  startIndex: number;
  endIndex: number;
};

type QuizData = {
  documentId: string;
  title: string;
  originalText: string;
  blanks: Blank[];
  difficulty: string;
};

export default function QuizPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const difficulty = searchParams.get("difficulty") || "medium";

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: params.documentId, difficulty }),
    })
      .then((res) => res.json())
      .then((data) => {
        setQuiz(data);
        setLoading(false);
      });
  }, [params.documentId, difficulty]);

  const handleAnswer = useCallback((index: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  }, []);

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);

    const answerList = quiz.blanks.map((blank, i) => ({
      keyword: blank.word,
      userAnswer: answers[i] || "",
    }));

    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: quiz.documentId,
          difficulty: quiz.difficulty,
          answers: answerList,
        }),
      });
      const result = await res.json();
      router.push(`/quiz/result/${result.id}`);
    } catch {
      setSubmitting(false);
    }
  };

  // 즉시 채점 (제출 전 개별 확인)
  const checkAnswer = (index: number) => {
    setRevealed((prev) => ({ ...prev, [index]: true }));
  };

  if (loading || !quiz) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
      </div>
    );
  }

  // 텍스트를 빈칸이 포함된 세그먼트로 분리
  const segments = buildSegments(quiz.originalText, quiz.blanks);
  const allAnswered = quiz.blanks.every((_, i) => answers[i]?.trim());

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          {quiz.title}
        </h1>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {quiz.difficulty === "easy"
            ? "쉬움"
            : quiz.difficulty === "medium"
            ? "보통"
            : "어려움"}{" "}
          | 빈칸 {quiz.blanks.length}개
        </span>
      </div>

      {/* 퀴즈 본문 */}
      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="whitespace-pre-wrap text-sm leading-loose text-zinc-700 dark:text-zinc-300">
          {segments.map((seg, i) => {
            if (seg.type === "text") {
              return <span key={i}>{seg.content}</span>;
            }
            // 빈칸
            const blankIdx = seg.blankIndex!;
            const userAnswer = answers[blankIdx] || "";
            const isRevealed = revealed[blankIdx];
            const isCorrect =
              userAnswer.trim().toLowerCase() ===
              quiz.blanks[blankIdx].word.trim().toLowerCase();

            return (
              <span key={i} className="inline-block align-bottom mx-0.5">
                <span className="relative">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => handleAnswer(blankIdx, e.target.value)}
                    onBlur={() => {
                      if (userAnswer.trim()) checkAnswer(blankIdx);
                    }}
                    disabled={submitted}
                    placeholder={`(${quiz.blanks[blankIdx].word.length}자)`}
                    className={`w-24 border-b-2 bg-transparent px-1 py-0.5 text-center text-sm outline-none transition-colors ${
                      isRevealed
                        ? isCorrect
                          ? "border-green-500 text-green-700 dark:text-green-400"
                          : "border-red-500 text-red-700 dark:text-red-400"
                        : "border-blue-400 text-zinc-900 focus:border-blue-600 dark:text-zinc-50"
                    }`}
                    style={{
                      width: `${Math.max(quiz.blanks[blankIdx].word.length * 1.2, 3)}em`,
                    }}
                  />
                  {isRevealed && !isCorrect && (
                    <span className="block text-xs text-green-600 dark:text-green-400">
                      {quiz.blanks[blankIdx].word}
                    </span>
                  )}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {submitting ? "제출 중..." : "제출하기"}
        </button>
        <button
          onClick={() =>
            router.push(`/quiz/${params.documentId}?difficulty=${difficulty}&t=${Date.now()}`)
          }
          className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          다시 섞기
        </button>
      </div>
    </div>
  );
}

// 텍스트를 일반 텍스트와 빈칸으로 분리
type Segment =
  | { type: "text"; content: string }
  | { type: "blank"; blankIndex: number };

function buildSegments(text: string, blanks: Blank[]): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;

  for (let i = 0; i < blanks.length; i++) {
    const blank = blanks[i];
    if (blank.startIndex > cursor) {
      segments.push({ type: "text", content: text.substring(cursor, blank.startIndex) });
    }
    segments.push({ type: "blank", blankIndex: i });
    cursor = blank.endIndex;
  }

  if (cursor < text.length) {
    segments.push({ type: "text", content: text.substring(cursor) });
  }

  return segments;
}
