import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { LogoutButton } from "@/components/logout-button";

interface NavProps {
  user: User | null;
  role: string | null;
}

export function Nav({ user, role }: NavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
              拾
            </span>
            <span className="text-lg font-bold tracking-wide text-stone-900">
              拾笔小说
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-stone-600 sm:flex">
            <Link href="/" className="transition hover:text-brand-600">
              首页
            </Link>
            <Link href="/works" className="transition hover:text-brand-600">
              书库
            </Link>
            <Link
              href="/dashboard/works/new"
              className="transition hover:text-brand-600"
            >
              投稿
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
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-stone-700 transition hover:text-brand-600"
              >
                我的作品
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-stone-600 transition hover:text-brand-600"
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
