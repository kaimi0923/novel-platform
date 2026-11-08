"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LANGS, LANG_COOKIE, type Lang } from "@/lib/i18n/dict";
import { useLang, useT } from "@/lib/i18n/client";

export function LangSwitcher({ className = "" }: { className?: string }) {
  const lang = useLang();
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(next: string) {
    // 存 cookie（一年），再刷新讓伺服器端重新渲染
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">{t("common.language")}</span>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-2 h-4 w-4 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
      </svg>
      <select
        value={lang as Lang}
        onChange={(e) => change(e.target.value)}
        disabled={pending}
        className="cursor-pointer appearance-none rounded-full border border-slate-200 bg-white py-1.5 pl-7 pr-6 text-xs text-slate-600 outline-none transition hover:border-brand-300 focus:border-brand-500 disabled:opacity-60"
      aria-label={t("common.language")}
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-1.5 h-3.5 w-3.5 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </label>
  );
}
