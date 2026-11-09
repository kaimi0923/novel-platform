import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { UserMenu } from "@/components/user-menu";
import { LangSwitcher } from "@/components/lang-switcher";
import { getT } from "@/lib/i18n/server";

interface NavProps {
  user: User | null;
  role: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  followerCount?: number;
  followingCount?: number;
}

export async function Nav({
  user,
  role,
  username = null,
  avatarUrl = null,
  followerCount = 0,
  followingCount = 0,
}: NavProps) {
  const { t } = await getT();
  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-gradient-to-r from-[#FFF6EC] via-[#FFE7F1] to-[#E9F1FF] shadow-[0_6px_20px_-12px_rgba(37,99,235,0.5)] backdrop-blur">
      <div className="h-[3px] w-full bg-gradient-to-r from-amber-400 via-rose-400 to-sky-400" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand-logo-nav-clear.png"
              alt="鬼點子"
              className="h-11 w-auto"
            />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 sm:flex">
            <Link href="/" className="rounded-full px-3 py-1.5 transition hover:bg-white/85 hover:text-brand-700 hover:shadow-sm">
              {t("nav.home")}
            </Link>
            <Link href="/art" className="rounded-full px-3 py-1.5 transition hover:bg-white/85 hover:text-brand-700 hover:shadow-sm">
              {t("nav.art")}
            </Link>
            <Link href="/comic" className="rounded-full px-3 py-1.5 transition hover:bg-white/85 hover:text-brand-700 hover:shadow-sm">
              {t("nav.comic")}
            </Link>
            <Link href="/works" className="rounded-full px-3 py-1.5 transition hover:bg-white/85 hover:text-brand-700 hover:shadow-sm">
              {t("nav.novel")}
            </Link>
            <Link href="/drama" className="rounded-full px-3 py-1.5 transition hover:bg-white/85 hover:text-brand-700 hover:shadow-sm">
              {t("nav.drama")}
            </Link>
            <Link
              href="/dashboard/works/new"
              className="rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-brand-500/30 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {t("nav.create")}
            </Link>
            {role === "admin" && (
              <Link href="/admin" className="rounded-full px-3 py-1.5 transition hover:bg-white/85 hover:text-brand-700 hover:shadow-sm">
                {t("nav.admin")}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LangSwitcher />
          {user ? (
            <UserMenu
              username={username}
              avatarUrl={avatarUrl}
              followerCount={followerCount}
              followingCount={followingCount}
              isAdmin={role === "admin"}
            />
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 transition hover:text-brand-600"
              >
                {t("nav.login")}
              </Link>
              <Link href="/signup" className="rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition hover:-translate-y-0.5 hover:shadow-lg">
                {t("nav.signup")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
