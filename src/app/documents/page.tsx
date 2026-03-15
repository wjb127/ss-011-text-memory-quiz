"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Document = {
  id: string;
  title: string;
  sourceType: string;
  keywordCount: number;
  createdAt: string;
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        setDocs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">내 자료</h1>
        <Link
          href="/documents/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          새 퀴즈 만들기
        </Link>
      </div>

      {docs.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-zinc-500">아직 저장된 자료가 없어요.</p>
          <Link
            href="/documents/new"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            첫 퀴즈 만들기
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {docs.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="block rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-300 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                {doc.title}
              </h3>
              <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                <span>키워드 {doc.keywordCount}개</span>
                <span>{new Date(doc.createdAt).toLocaleDateString("ko-KR")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
