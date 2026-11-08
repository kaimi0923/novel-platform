import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { UserMenu } from "@/components/user-menu";

interface NavProps {
  user: User | null;
  role: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  followerCount?: number;
  followingCount?: number;
}

export function Nav({
  user,
  role,
  username = null,
  avatarUrl = null,
  followerCount = 0,
  followingCount = 0,
}: NavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand-logo-nav.png"
              alt="鬼点子"
              className="h-11 w-auto"
            />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 sm:flex">
            <Link href="/" className="transition hover:text-brand-600">
              首页
            </Link>
            <Link href="/art" className="transition hover:text-brand-600">
              插画
            </Link>
            <Link href="/comic" className="transition hover:text-brand-600">
              漫画
            </Link>
            <Link href="/works" className="transition hover:text-brand-600">
              小说
            </Link>
            <Link href="/drama" className="transition hover:text-brand-600">
              短剧
            </Link>
            <Link
              href="/dashboard/works/new"
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-700"
            >
              + 创作
            </Link>
            {role === "admin" && (
              <Link href="/admin" className="transition hover:text-brand-600">
                审核后台
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
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
                登录
              </Link>
              <Link href="/signup" className="btn-primary !py-2 text-sm">
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
