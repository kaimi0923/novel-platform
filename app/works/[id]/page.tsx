import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getWorkWithChapters,
  getFavoriteCount,
  getIsFavorited,
  getWorkComments,
} from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { FavoriteButton } from "@/components/favorite-button";
import { CommentSection } from "@/components/comment-section";

export const dynamic = "force-dynamic";

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { work, chapters } = await getWorkWithChapters(id);
  const favoriteCount = await getFavoriteCount(id);
  const isFavorited = await getIsFavorited(id, user?.id ?? null);
  const comments = await getWorkComments(id);

  // 未通过审核的作品：仅作者和管理员可见
  let isAdmin = false;
  if (work.status !== "approved") {
    let canView = false;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      isAdmin = profile?.role === "admin";
      canView = user.id === work.author_id || isAdmin;
    }
    if (!canView) notFound();
  } else if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  const canManage = user?.id === work.author_id || isAdmin;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* 封面 */}
          <div className="mx-auto flex h-48 w-36 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 px-2 text-center sm:mx-0">
            {work.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={work.cover_url}
                alt={work.title}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <span className="line-clamp-5 text-sm font-bold leading-snug text-white drop-shadow">
                {work.title}
              </span>
            )}
          </div>

          {/* 信息 */}
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                {work.category}
              </span>
              <span className="text-xs text-slate-400">
                {chapters.length} 章 · {work.view_count} 阅读 · {favoriteCount} 收藏
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{work.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              作者：{work.author?.username ?? "佚名"}
            </p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {work.description ?? "作者还没有写简介。"}
            </p>

            {work.status !== "approved" && (
              <div className="mt-4">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                  {work.status === "pending" ? "作品待审核，暂时仅自己可见" : "作品未通过审核"}
                </span>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {chapters.length > 0 ? (
                <Link
                  href={`/read/${work.id}/${chapters[0].id}`}
                  className="btn-primary !px-6 !py-3"
                >
                  {work.status === "approved" ? "开始阅读" : "预览阅读"}
                </Link>
              ) : (
                <span className="text-sm text-slate-400">还没有章节</span>
              )}
              {work.status === "approved" && (
                <FavoriteButton
                  workId={work.id}
                  initialCount={favoriteCount}
                  initialFavorited={isFavorited}
                  loggedIn={!!user}
                />
              )}
              {user?.id === work.author_id && (
                <Link
                  href={`/dashboard/works/${work.id}/chapters/new`}
                  className="btn-secondary !px-6 !py-3"
                >
                  添加章节
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 章节列表 */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">章节列表</h2>
        {chapters.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            这本书还没有章节，作者正在努力码字中…
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {chapters.map((ch) => (
              <Link
                key={ch.id}
                href={`/read/${work.id}/${ch.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm transition hover:border-brand-400 hover:text-brand-600"
              >
                <span className="truncate">
                  <span className="mr-2 text-slate-400">{ch.chapter_order}.</span>
                  {ch.title}
                </span>
                <span className="shrink-0 text-xs text-slate-400">阅读 →</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 留言区 */}
      <CommentSection
        workId={work.id}
        initialComments={comments}
        loggedIn={!!user}
        canManage={canManage}
      />
    </div>
  );
}
