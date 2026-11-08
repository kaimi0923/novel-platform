import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white pb-20">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <p>鬼點子 · 原創小說投稿與閱讀平臺</p>
          <p>作者投稿經審核後上架 · 內容依台灣法規分級與管理</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-400 sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/terms" className="hover:text-brand-600">
              服務條款
            </Link>
            <Link href="/privacy" className="hover:text-brand-600">
              隱私政策
            </Link>
            <Link href="/copyright" className="hover:text-brand-600">
              著作權保護
            </Link>
          </div>
          <p>內容分級依《電腦網路內容分級處理辦法》標示 · 檢舉請於播放頁提出</p>
        </div>
      </div>
    </footer>
  );
}
