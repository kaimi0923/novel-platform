import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyWorks } from "@/lib/supabase/queries";
import { STATUS_LABEL, STATUS_COLOR } from "@/lib/constants";
import { redirect } from "next/navigation";
import { AppealDialog } from "@/components/appeal-dialog";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 當前使用者檔案（頭像/封面/暱稱/實名狀態）
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, cover_url, real_name, verify_status")
    .eq("id", user.id)
    .single();

  const works = await getMyWorks(user.id);

  // 我收藏的作品數量
  const { count: myFavoriteCount } = await supabase
    .from("favorites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // 我關注的作者數量
  const { count: myFollowingCount } = await supabase
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("follower_id", user.id);

  // 資料中心統計
  const totalChapters = works.reduce((s, w) => s + (w.chapter_count ?? 0), 0);
  const totalViews = works.reduce((s, w) => s + (w.view_count ?? 0), 0);
  const totalFavorites = works.reduce((s, w) => s + (w.favorite_count ?? 0), 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* 作者橫幅（頭像 + 封面 + 暱稱） */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* 封面背景 */}
        <div
          className="flex h-36 items-end justify-start bg-gradient-to-br from-slate-800 via-indigo-800 to-brand-700 p-6 sm:h-44"
          style={
            profile?.cover_url
              ? {
                  backgroundImage: `url(${profile.cover_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <div className="flex items-end gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-brand-400 to-brand-600 text-2xl font-bold text-white shadow"
              style={
                profile?.avatar_url
                  ? {
                      backgroundImage: `url(${profile.avatar_url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              {!profile?.avatar_url && (
                <span className="text-xl">
                  {(profile?.username ?? "作").slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div className="pb-1">
              <p className="text-lg font-bold text-white drop-shadow">
                {profile?.username ?? "作者"}
              </p>
              <p className="text-xs text-white/80">
                共 {works.length} 部作品 · {totalChapters} 章 · {totalViews} 閱讀
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-3">
          <p className="text-xs text-slate-400">
            作者專區 · 管理你的作品與個人資料
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/verify"
              className="btn-secondary !px-4 !py-1.5 !text-xs"
            >
              {profile?.verify_status === "approved"
                ? "已實名認證 ✓"
                : profile?.verify_status === "pending"
                  ? "實名稽核中"
                  : profile?.verify_status === "rejected"
                    ? "實名未透過，重試"
                    : "實名認證"}
            </Link>
            <Link
              href="/dashboard/profile"
              className="btn-secondary !px-4 !py-1.5 !text-xs"
            >
              編輯個人資料
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">我的作品</h1>
          <p className="mt-1 text-sm text-slate-500">
            投稿後需經管理員稽核，稽核透過即可在書庫展示
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/favorites" className="btn-secondary">
            我的收藏{myFavoriteCount ? ` ${myFavoriteCount}` : ""}
          </Link>
          <Link href="/dashboard/following" className="btn-secondary">
            我的關注{myFollowingCount ? ` ${myFollowingCount}` : ""}
          </Link>
          <Link href="/dashboard/comments" className="btn-secondary">
            留言管理
          </Link>
          <Link href="/dashboard/works/new" className="btn-primary">
            ＋ 釋出新作品
          </Link>
        </div>
      </div>

      {/* 資料中心：作品資料統計 */}
      {works.length > 0 && (
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{totalChapters}</p>
            <p className="mt-1 text-xs text-slate-500">總章節數</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{totalViews}</p>
            <p className="mt-1 text-xs text-slate-500">總閱讀數</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{totalFavorites}</p>
            <p className="mt-1 text-xs text-slate-500">總收藏數</p>
          </div>
        </div>
      )}

      {works.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500">你還沒有投稿作品</p>
          <Link href="/dashboard/works/new" className="btn-primary mt-4">
            釋出第一本作品
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {works.map((work) => (
            <div
              key={work.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[work.status]}`}
                    >
                      {STATUS_LABEL[work.status]}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                      {work.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {work.chapter_count ?? 0} 章 · {work.view_count} 閱讀 ·{" "}
                      {work.favorite_count ?? 0} 收藏
                    </span>
                  </div>
                  <Link
                    href={`/works/${work.id}`}
                    className="text-lg font-semibold text-slate-900 transition hover:text-brand-600"
                  >
                    {work.title}
                  </Link>
                  {work.status === "rejected" && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-lg bg-rose-50 px-3 py-1.5">
                      {work.reject_reason && (
                        <p className="text-xs text-rose-700">駁回原因：{work.reject_reason}</p>
                      )}
                      <AppealDialog workId={work.id} workTitle={work.title} />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <Link
                  href={
                    work.type === "drama"
                      ? `/dashboard/works/${work.id}/episodes/new`
                      : `/dashboard/works/${work.id}/chapters/new`
                  }
                  className="btn-primary !px-3 !py-1.5 !text-xs"
                >
                  {work.type === "drama" ? "上傳劇集" : "新增章節"}
                </Link>
                {work.type === "drama" && (
                  <Link
                    href={`/drama/${work.id}`}
                    className="btn-secondary !px-3 !py-1.5 !text-xs"
                  >
                    播放頁
                  </Link>
                )}
                <Link
                  href={`/dashboard/works/${work.id}/edit`}
                  className="btn-secondary !px-3 !py-1.5 !text-xs"
                >
                  編輯資訊
                </Link>
                <Link
                  href={`/works/${work.id}`}
                  className="btn-secondary !px-3 !py-1.5 !text-xs"
                >
                  檢視頁面
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
