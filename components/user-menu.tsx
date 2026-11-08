"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n/client";

interface UserMenuProps {
  username: string | null;
  avatarUrl: string | null;
  followerCount: number;
  followingCount: number;
  isAdmin: boolean;
}

const LINKS = [
  { href: "/dashboard/stats", labelKey: "menu.stats" },
  { href: "/dashboard", labelKey: "menu.works" },
  { href: "/dashboard/favorites", labelKey: "menu.favorites" },
  { href: "/dashboard/history", labelKey: "menu.history" },
  { href: "/dashboard/following", labelKey: "menu.following" },
  { href: "/dashboard/comments", labelKey: "menu.comments" },
  { href: "/notifications", labelKey: "menu.notifications" },
  { href: "/dashboard/verify", labelKey: "menu.verify" },
  { href: "/dashboard/profile", labelKey: "menu.profile" },
];

export function UserMenu({
  username,
  avatarUrl,
  followerCount,
  followingCount,
  isAdmin,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const t = useT();
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const initial = (username ?? "讀").slice(0, 1);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="帳號選單"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">
              @{username ?? "新使用者"}
            </p>
            <div className="mt-2 flex gap-6 text-xs text-slate-500">
              <span>
                <b className="font-semibold text-slate-900">{followingCount}</b>{" "}
                關注
              </span>
              <span>
                <b className="font-semibold text-slate-900">{followerCount}</b>{" "}
                粉絲
              </span>
            </div>
          </div>

          <nav className="px-1 py-1">
            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                {t(item.labelKey)}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-brand-600 transition hover:bg-slate-50"
              >
                {t("menu.admin")}
              </Link>
            )}
          </nav>

          <div className="border-t border-slate-100 px-1 py-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              {t("menu.logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
