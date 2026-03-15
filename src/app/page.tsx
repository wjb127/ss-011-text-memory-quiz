import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-5xl">
        텍스트를 넣으면
        <br />
        <span className="text-blue-600 dark:text-blue-400">빈칸 퀴즈</span>가 됩니다
      </h1>
      <p className="mt-4 max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        어떤 자료든 붙여넣기만 하면 AI가 핵심 키워드를 찾아 빈칸 채우기 퀴즈를 자동 생성합니다.
      </p>
      <div className="mt-8">
        <Link
          href="/documents/new"
          className="rounded-xl bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors"
        >
          시작하기
        </Link>
      </div>
      <div className="mt-16 grid w-full max-w-2xl grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 p-5 text-left dark:border-zinc-800">
          <div className="text-2xl">1</div>
          <h3 className="mt-2 font-semibold text-zinc-900 dark:text-zinc-50">텍스트 입력</h3>
          <p className="mt-1 text-sm text-zinc-500">학습할 내용을 붙여넣기</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-5 text-left dark:border-zinc-800">
          <div className="text-2xl">2</div>
          <h3 className="mt-2 font-semibold text-zinc-900 dark:text-zinc-50">AI 분석</h3>
          <p className="mt-1 text-sm text-zinc-500">핵심 키워드 자동 추출</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-5 text-left dark:border-zinc-800">
          <div className="text-2xl">3</div>
          <h3 className="mt-2 font-semibold text-zinc-900 dark:text-zinc-50">퀴즈 풀기</h3>
          <p className="mt-1 text-sm text-zinc-500">빈칸을 채워 암기 완성</p>
        </div>
      </div>
    </div>
  );
}
