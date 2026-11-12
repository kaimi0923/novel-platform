"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * 限制級（18+）年齡確認遮罩
 * 作品 content_rating 為 restricted 時，未確認年齡前不顯示內容
 */
export function AgeGate({
  workId,
  rating,
  backHref = "/",
  backLabel = "返回",
  children,
}: {
  workId: string;
  rating?: string | null;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}) {
  const adult = rating === "restricted";
  const [ok, setOk] = useState(!adult);

  useEffect(() => {
    if (!adult) return;
    setOk(localStorage.getItem(`age_ok_${workId}`) === "1");
  }, [adult, workId]);

  if (ok) return <>{children}</>;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">
        18+ 限制級
      </span>
      <h1 className="text-xl font-bold text-slate-900">此內容為限制級</h1>
      <p className="text-sm leading-relaxed text-slate-500">
        依台灣《電腦網路內容分級處理辦法》，未滿 18 歲者不得瀏覽本內容。
        點擊下方按鈕即表示你已年滿 18 歲，並自行承擔瀏覽後果。
      </p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(`age_ok_${workId}`, "1");
          setOk(true);
        }}
        className="btn-primary w-full max-w-xs"
      >
        我已滿 18 歲，繼續瀏覽
      </button>
      <Link href={backHref} className="text-sm text-slate-400 transition hover:text-slate-600">
        {backLabel}
      </Link>
    </div>
  );
}
