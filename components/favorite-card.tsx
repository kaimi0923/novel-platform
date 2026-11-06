"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface FavoriteCardData {
  id: string;
  title: string;
  cover_url: string | null;
  category: string;
  type: string;
  status: string;
  view_count: number;
  favorite_count: number;
  favorited_at: string;
  author_username: string | null;
  author_avatar: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  novel: "小说",
  art: "插画",
  comic: "漫画",
};

/** 收藏列表卡片：显示作品与作者，可一键取消收藏 */
export function FavoriteCard({ work }: { work: FavoriteCardData }) {
  const [removed, setRemoved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (loading) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("work_id", work.id);
    setLoading(false);
    if (!error) setRemoved(true);
  }

  if (removed) return null;

  return (
    <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <Link href={`/works/${work.id}`} className="shrink-0">
        {work.cover_url ? (
          <img
            src={work.cover_url}
            alt={work.title}
            className="h-28 w-[84px] rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-28 w-[84px] items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
            无封面
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[11px] font-medium text-brand-700">
            {TYPE_LABEL[work.type] ?? "小说"}
          </span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
            {work.category}
          </span>
          {work.status !== "approved" && (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-700">
              已下架
            </span>
          )}
        </div>

        <Link
          href={`/works/${work.id}`}
          className="block truncate text-base font-semibold text-slate-900 transition hover:text-brand-600"
        >
          {work.title}
        </Link>

        <div className="mt-2 flex items-center gap-2">
          {work.author_avatar ? (
            <img
              src={work.author_avatar}
              alt={work.author_username ?? "作者"}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[11px] font-bold text-white">
              {(work.author_username ?? "作").slice(0, 1).toUpperCase()}
            </div>
          )}
          <span className="truncate text-xs text-slate-600">
            作者：{work.author_username ?? "未知作者"}
          </span>
        </div>

        <p className="mt-1 text-[11px] text-slate-400">
          收藏于 {work.favorited_at.slice(0, 10)} · {work.view_count} 阅读 ·{" "}
          {work.favorite_count} 收藏
        </p>

        <div className="mt-3 flex items-center gap-2">
          <Link
            href={`/works/${work.id}`}
            className="btn-secondary !px-3 !py-1.5 !text-xs"
          >
            查看作品
          </Link>
          <button
            onClick={handleRemove}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-50"
          >
            {loading ? "处理中…" : "取消收藏"}
          </button>
        </div>
      </div>
    </div>
  );
}
