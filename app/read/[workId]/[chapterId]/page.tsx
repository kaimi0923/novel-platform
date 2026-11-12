import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapterWithContext } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { AgeGate } from "@/components/age-gate";
import { ReportDialog } from "@/components/report-dialog";

export const dynamic = "force-dynamic";

export default async function ReadPage({
  params,
}: {
  params: Promise<{ workId: string; chapterId: string }>;
}) {
  const { workId, chapterId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { work, chapter, chapters } = await getChapterWithContext(
    workId,
    chapterId
  );

  // 未透過稽核的作品：僅作者和管理員可讀
  if (work.status !== "approved") {
    let canView = false;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      canView = user.id === work.author_id || profile?.role === "admin";
    }
    if (!canView) notFound();
  }

  // 作品瀏覽數 +1（已透過稽核才計數）
  if (work.status === "approved") {
    await supabase.rpc("increment_view_count", { work_id: workId });
  }

  const idx = chapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = idx > 0 ? chapters[idx - 1] : null;
  const nextChapter = idx < chapters.length - 1 ? chapters[idx + 1] : null;

  const paragraphs = chapter.content.split(/\n+/).filter((p) => p.trim());
  const images = chapter.images ?? [];

  // 解析正文中的 [插圖N] 標記，替換為對應圖片
  const usedImageIndexes = new Set<number>();
  const body = paragraphs.map((p, i) => {
    const m = p.match(/^\[插圖(\d+)\]$/);
    if (m) {
      const idx = parseInt(m[1], 10);
      if (idx >= 1 && idx <= images.length) {
        usedImageIndexes.add(idx);
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`img-${i}`}
            src={images[idx - 1]}
            alt={`插圖${idx}`}
            className="mx-auto my-4 w-full max-w-xl rounded-lg object-contain"
          />
        );
      }
      return null;
    }
    return <p key={i}>{p}</p>;
  });
  // 未被引用的插圖顯示在正文末尾
  const leftoverImages = images
    .map((url, idx) => ({ url, idx: idx + 1 }))
    .filter(({ idx }) => !usedImageIndexes.has(idx));

  return (
    <AgeGate
      workId={work.id}
      rating={work.content_rating}
      backHref={`/works/${work.id}`}
      backLabel="回到作品頁"
    >
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* 頂部導航 */}
      <div className="mb-6 flex items-center justify-between text-sm">
        <Link
          href={`/works/${work.id}`}
          className="flex items-center gap-1 text-slate-500 transition hover:text-brand-600"
        >
          <span>←</span> {work.title}
        </Link>
        <span className="text-slate-400">
          {chapters.length} 章 · 第 {chapter.chapter_order} 章
        </span>
      </div>

      {/* 正文 */}
      <article className="rounded-2xl border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-10">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">{chapter.title}</h1>
          <p className="mt-2 text-sm text-slate-400">
            《{work.title}》 · {work.author?.username ?? "佚名"}
          </p>
        </header>

        {/* 章節插圖（正文開頭） */}
        {images.length > 0 && leftoverImages.length === images.length && (
          <div className="mb-8 space-y-4">
            {images.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt={`${chapter.title}插圖${i + 1}`}
                className="mx-auto w-full max-w-xl rounded-lg object-contain"
              />
            ))}
          </div>
        )}

        <div className="prose-novel">
          {body}
          {/* 正文中未被引用的插圖（相容舊章節，排在末尾） */}
          {leftoverImages.length > 0 && (
            <div className="mt-8 space-y-4">
              {leftoverImages.map(({ url, idx }) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`leftover-${idx}`}
                  src={url}
                  alt={`${chapter.title}插圖${idx}`}
                  className="mx-auto w-full max-w-xl rounded-lg object-contain"
                />
              ))}
            </div>
          )}
        </div>

        {/* 章節切換 */}
        <nav className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
          {prevChapter ? (
            <Link
              href={`/read/${work.id}/${prevChapter.id}`}
              className="btn-secondary"
            >
              ← 上一章
            </Link>
          ) : (
            <span />
          )}
          <Link href={`/works/${work.id}`} className="text-sm text-slate-400 transition hover:text-brand-600">
            目錄
          </Link>
          {nextChapter ? (
            <Link
              href={`/read/${work.id}/${nextChapter.id}`}
              className="btn-primary"
            >
              下一章 →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>

      <p className="mt-8 text-center text-xs text-slate-400">
        本章節由作者原創投稿，未經授權禁止轉載
      </p>
      <div className="mt-6 flex justify-center">
        <ReportDialog workId={work.id} workTitle={work.title} />
      </div>
    </div>
    </AgeGate>
  );
}
