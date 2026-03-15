"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type QuizAnswer = {
  keyword: string;
  userAnswer: string;
  isCorrect: boolean;
};

type Attempt = {
  id: string;
  documentId: string;
  difficulty: string;
  totalBlanks: number;
  correctCount: number;
  answers: QuizAnswer[];
  completedAt: string;
};

export default function QuizResultPage() {
  const params = useParams();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // quiz_attempts 데이터를 가져오기 위한 간단한 API 필요
    // 일단 localStorage 대신 서버에서 가져오기
    fetch(`/api/quiz/attempt/${params.attemptId}`)
      .then((res) => res.json())
      .then(setAttempt)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [params.attemptId]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="text-center mt-16">
        <p className="text-zinc-500">결과를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const score = Math.round((attempt.correctCount / attempt.totalBlanks) * 100);

  return (
    <div className="mx-auto max-w-2xl">
      {/* 점수 */}
      <div className="text-center">
        <div
          className={`inline-flex h-28 w-28 items-center justify-center rounded-full text-3xl font-bold ${
            score >= 80
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : score >= 50
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {score}점
        </div>
        <p className="mt-3 text-lg font-medium text-zinc-900 dark:text-zinc-50">
          {attempt.correctCount} / {attempt.totalBlanks} 정답
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          {score >= 80
            ? "훌륭해요!"
            : score >= 50
            ? "조금만 더 노력하면 돼요!"
            : "다시 한번 도전해보세요!"}
        </p>
      </div>

      {/* 답안 상세 */}
      <div className="mt-8 space-y-2">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          답안 상세
        </h2>
        {attempt.answers.map((ans, i) => (
          <div
            key={i}
            className={`flex items-center justify-between rounded-lg border p-3 ${
              ans.isCorrect
                ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  ans.isCorrect
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-700 dark:text-red-400"
                }`}
              >
                {ans.isCorrect ? "O" : "X"}
              </span>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                정답: <strong>{ans.keyword}</strong>
              </span>
            </div>
            {!ans.isCorrect && (
              <span className="text-sm text-zinc-500">
                내 답: {ans.userAnswer || "(미입력)"}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 액션 버튼 */}
      <div className="mt-8 flex gap-3">
        <Link
          href={`/quiz/${attempt.documentId}?difficulty=${attempt.difficulty}`}
          className="flex-1 rounded-xl bg-blue-600 py-3 text-center text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          다시 풀기
        </Link>
        <Link
          href={`/documents/${attempt.documentId}`}
          className="flex-1 rounded-xl border border-zinc-300 py-3 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          자료로 돌아가기
        </Link>
      </div>
    </div>
  );
}
