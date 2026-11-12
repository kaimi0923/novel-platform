import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getWorkWithChapters,
  getFavoriteCount,
  getIsFavorited,
  getIsFollowing,
  getMyRating,
  getWorkComments,
  recordView,
} from "@/lib/supabase/queries";
import { AI_USAGE_LABEL } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { FavoriteButton } from "@/components/favorite-button";
import { FollowButton } from "@/components/follow-button";
import { RateWork } from "@/components/rate-work";
import { CommentSection } from "@/components/comment-section";
import { AgeGate } from "@/components/age-gate";
import { ReportDialog } from "@/components/report-dialog";

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

  // 短劇：劇集列表
  const { data: dramaEpisodes } =
    work.type === "drama"
      ? await supabase
          .from("episodes")
          .select("id, episode_order, title, duration")
          .eq("work_id", id)
          .order("episode_order", { ascending: true })
      : { data: null };
  const episodes = dramaEpisodes ?? [];
  const favoriteCount = await getFavoriteCount(id);
  const isFavorited = await getIsFavorited(id, user?.id ?? null);
  const isFollowingAuthor = await getIsFollowing(work.author_id, user?.id ?? null);
  const myRating = await getMyRating(id, user?.id ?? null);
  const comments = await getWorkComments(id);

  // 登入使用者寫入瀏覽記錄（表未建立時靜默忽略，不影響閱讀）
  if (user) {
    await recordView(user.id, id);
  }

  // 未透過稽核的作品：僅作者和管理員可見
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
  // 插畫/漫畫：以圖片為主視覺展示
  const isVisual = work.type === "art" || work.type === "comic";
  const isDrama = work.type === "drama";
  const typeLabel =
    work.type === "art"
      ? "插畫"
      : work.type === "comic"
        ? "漫畫"
        : work.type === "drama"
          ? "短劇"
          : "小說";

  const backHref =
    work.type === "art" ? "/art" : work.type === "comic" ? "/comic" : work.type === "drama" ? "/drama" : "/works";

  return (
    <AgeGate
      workId={work.id}
      rating={work.content_rating}
      backHref={backHref}
      backLabel="離開此頁"
    >
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {isVisual ? (
          /* 插畫/漫畫：大圖主視覺 */
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-xl bg-slate-100">
              {work.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={work.cover_url}
                  alt={work.title}
                  className="mx-auto max-h-[70vh] w-full object-contain"
                />
              ) : (
                <div className="flex h-72 items-center justify-center bg-gradient-to-br from-brand-400 to-indigo-600 px-4 text-center">
                  <span className="text-lg font-bold text-white drop-shadow">
                    {work.title}
                  </span>
                </div>
              )}
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                  {typeLabel}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {work.category}
                </span>
                <span
                  className={
                    work.is_completed
                      ? "rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                      : "rounded bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
                  }
                >
                  {work.is_completed ? "已完結" : "連載中"}
                </span>
                <span className="text-xs text-slate-400">
                  {work.view_count} 閱讀 · ★{" "}
                  {(work.rating_average ?? 0).toFixed(1)}（{work.rating_count ?? 0}）
                  · {favoriteCount} 收藏
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{work.title}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                {work.author?.avatar_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={work.author.avatar_url}
                    alt="作者頭像"
                    className="h-5 w-5 rounded-full object-cover"
                  />
                )}
                <span>作者：{work.author?.username ?? "佚名"}</span>
              </p>
              {user && user.id !== work.author_id && (
                <div className="mt-2">
                  <FollowButton
                    authorId={work.author_id}
                    loggedIn={!!user}
                    initialFollowing={isFollowingAuthor}
                  />
                </div>
              )}
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {work.description ?? "作者還沒有寫簡介。"}
              </p>

              {work.author_note && (
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-xs font-medium text-slate-500">作者的話</p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {work.author_note}
                  </p>
                </div>
              )}

              {work.ai_usage && (
                <p className="mt-3 text-xs text-slate-500">
                  製作方式：
                  <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                    {AI_USAGE_LABEL[work.ai_usage] ?? work.ai_usage}
                  </span>
                </p>
              )}

              {work.tags && work.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {work.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {work.status !== "approved" && (
                <div className="mt-4">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                    {work.status === "pending" ? "作品待稽核，暫時僅自己可見" : "作品未透過稽核"}
                  </span>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {chapters.length > 0 && (
                  <Link
                    href={`/read/${work.id}/${chapters[0].id}`}
                    className="btn-primary !px-6 !py-3"
                  >
                    {work.status === "approved" ? "開始瀏覽" : "預覽"}
                  </Link>
                )}
                {work.status === "approved" && (
                  <FavoriteButton
                    workId={work.id}
                    initialCount={favoriteCount}
                    initialFavorited={isFavorited}
                    loggedIn={!!user}
                  />
                )}
                {work.status === "approved" && user?.id !== work.author_id && (
                  <RateWork
                    workId={work.id}
                    loggedIn={!!user}
                    initialScore={myRating}
                  />
                )}
                {user?.id === work.author_id && (
                  <Link
                    href={`/dashboard/works/${work.id}/chapters/new`}
                    className="btn-secondary !px-6 !py-3"
                  >
                    新增內容
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* 小說：封面 + 資訊 */
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

            {/* 資訊 */}
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                  {work.category}
                </span>
                <span
                  className={
                    work.is_completed
                      ? "rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                      : "rounded bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
                  }
                >
                  {work.is_completed ? "已完結" : "連載中"}
                </span>
                <span className="text-xs text-slate-400">
                  {chapters.length} 章 · {work.word_count ?? 0} 字 ·{" "}
                  {work.view_count} 閱讀 · ★{" "}
                  {(work.rating_average ?? 0).toFixed(1)}（{work.rating_count ?? 0}）
                  · {favoriteCount} 收藏
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{work.title}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                {work.author?.avatar_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={work.author.avatar_url}
                    alt="作者頭像"
                    className="h-5 w-5 rounded-full object-cover"
                  />
                )}
                <span>作者：{work.author?.username ?? "佚名"}</span>
              </p>
              {user && user.id !== work.author_id && (
                <div className="mt-2">
                  <FollowButton
                    authorId={work.author_id}
                    loggedIn={!!user}
                    initialFollowing={isFollowingAuthor}
                  />
                </div>
              )}
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {work.description ?? "作者還沒有寫簡介。"}
              </p>

              {work.author_note && (
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-xs font-medium text-slate-500">作者的話</p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {work.author_note}
                  </p>
                </div>
              )}

              {work.ai_usage && (
                <p className="mt-3 text-xs text-slate-500">
                  製作方式：
                  <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                    {AI_USAGE_LABEL[work.ai_usage] ?? work.ai_usage}
                  </span>
                </p>
              )}

              {work.tags && work.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {work.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {work.status !== "approved" && (
                <div className="mt-4">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                    {work.status === "pending" ? "作品待稽核，暫時僅自己可見" : "作品未透過稽核"}
                  </span>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {isDrama ? (
                  <Link
                    href={`/drama/${work.id}`}
                    className="btn-primary !px-6 !py-3"
                  >
                    ▶ 立即觀看（共 {episodes.length} 集）
                  </Link>
                ) : chapters.length > 0 ? (
                  <Link
                    href={`/read/${work.id}/${chapters[0].id}`}
                    className="btn-primary !px-6 !py-3"
                  >
                    {work.status === "approved" ? "開始閱讀" : "預覽閱讀"}
                  </Link>
                ) : (
                  <span className="text-sm text-slate-400">還沒有章節</span>
                )}
                {work.status === "approved" && (
                  <FavoriteButton
                    workId={work.id}
                    initialCount={favoriteCount}
                    initialFavorited={isFavorited}
                    loggedIn={!!user}
                  />
                )}
                {work.status === "approved" && user?.id !== work.author_id && (
                  <RateWork
                    workId={work.id}
                    loggedIn={!!user}
                    initialScore={myRating}
                  />
                )}
                {user?.id === work.author_id && (
                  <Link
                    href={
                      isDrama
                        ? `/dashboard/works/${work.id}/episodes/new`
                        : `/dashboard/works/${work.id}/chapters/new`
                    }
                    className="btn-secondary !px-6 !py-3"
                  >
                    {isDrama ? "上傳劇集" : "新增章節"}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 短劇劇集列表 */}
      {isDrama && episodes.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            劇集（共 {episodes.length} 集）
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {episodes.map((ep) => (
              <Link
                key={ep.id}
                href={`/drama/${work.id}?ep=${ep.episode_order}`}
                className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-3 text-sm transition hover:border-brand-400 hover:text-brand-600"
              >
                <span className="font-medium">{ep.episode_order}</span>
                <span className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                  {ep.title ?? `第 ${ep.episode_order} 集`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 章節列表（插畫/漫畫有連載內容時也顯示） */}
      {chapters.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {isVisual ? "內容列表" : "章節列表"}
          </h2>
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
                <span className="shrink-0 text-xs text-slate-400">
                  {isVisual ? "檢視 →" : "閱讀 →"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 留言區 */}
      <CommentSection
        workId={work.id}
        initialComments={comments}
        loggedIn={!!user}
        canManage={canManage}
      />

      {/* 舉報入口 */}
      <div className="mt-8 flex justify-center">
        <ReportDialog workId={work.id} workTitle={work.title} />
      </div>
    </div>
    </AgeGate>
  );
}
