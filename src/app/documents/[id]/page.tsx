"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Document = {
  id: string;
  title: string;
  originalText: string;
  keywords: { word: string; startIndex: number; endIndex: number }[];
  sourceType: string;
  createdAt: string;
};

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/documents/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setDoc)
      .catch(() => setDoc(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setDeleting(true);
    await fetch(`/api/documents/${params.id}`, { method: "DELETE" });
    router.push("/documents");
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center mt-16">
        <p className="text-zinc-500">자료를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{doc.title}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        키워드 {doc.keywords.length}개 |{" "}
        {new Date(doc.createdAt).toLocaleDateString("ko-KR")}
      </p>

      {/* 원본 텍스트 미리보기 */}
      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {doc.originalText.length > 300
            ? doc.originalText.substring(0, 300) + "..."
            : doc.originalText}
        </p>
      </div>

      {/* 난이도 선택 + 퀴즈 시작 */}
      <div className="mt-6 space-y-3">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          난이도를 선택하세요
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {(["easy", "medium", "hard"] as const).map((diff) => (
            <Link
              key={diff}
              href={`/quiz/${doc.id}?difficulty=${diff}`}
              className="rounded-xl border border-zinc-200 bg-white p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
            >
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {diff === "easy" ? "쉬움" : diff === "medium" ? "보통" : "어려움"}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                ~{diff === "easy" ? "20" : diff === "medium" ? "40" : "60"}% 빈칸
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 삭제 버튼 */}
      <div className="mt-8 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
        >
          {deleting ? "삭제 중..." : "이 자료 삭제"}
        </button>
      </div>
    </div>
  );
}
