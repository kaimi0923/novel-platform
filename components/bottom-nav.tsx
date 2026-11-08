"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/client";

const ITEMS = [
  {
    key: "home",
    labelKey: "bottom.home",
    href: "/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
      </svg>
    ),
  },
  {
    key: "search",
    labelKey: "bottom.search",
    href: "/search",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4-4" />
      </svg>
    ),
  },
  {
    key: "create",
    labelKey: "bottom.create",
    href: "/dashboard/works/new",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    key: "notify",
    labelKey: "bottom.notify",
    href: "/notifications",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </svg>
    ),
  },
  {
    key: "me",
    labelKey: "bottom.me",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
      </svg>
    ),
  },
];

/** 底部快捷鍵導航（App 風格）：首頁 / 搜尋 / 創作 / 通知 / 我的 */
export function BottomNav() {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map((item) => {
          const active =
            item.key === "home"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition ${
                active ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {item.icon}
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
