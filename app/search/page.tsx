"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Work } from "@/lib/types";
import { GalleryGrid } from "@/components/gallery-grid";

const TYPE_LABEL: Record<string, string> = {
  novel: "小说",
  art: "插画",
  comic: "漫画",
};

export default function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Work[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const kw = keyword.trim();
    if (!kw) return;
    setSearching(true);
    setError(null);

    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("works")
      .select("*, author:profiles!works_author_id_fkey(username, avatar_url), chapters(count), favorites(count)")
      .eq("status", "approved")
      .or(`title.ilike.%${kw}%,description.ilike.%${kw}%`)
      .order("created_at", { ascending: false })
      .limit(60);

    if (err) {
      setError(err.message);
      setResults([]);
    } else {
      setResults(
        (data ?? []).map((row) => ({
          ...row,
          chapter_count: row.chapters?.[0]?.count ?? 0,
          favorite_count: row.favorites?.[0]?.count ?? 0,
        })) as Work[]
      );
    }
    setSearching(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">搜索</h1>
      <p className="mt-1 text-sm text-slate-500">
        搜索作品名称、简介，找到你想看的
      </p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="输入关键词，如：甜宠、穿越、幽灵…"
          className="input-base flex-1"
        />
        <button type="submit" disabled={searching} className="btn-primary">
          {searching ? "搜索中…" : "搜索"}
        </button>
      </form>

      {/* 快捷类型筛选 */}
      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className="text-slate-400">分类：</span>
        {Object.entries(TYPE_LABEL).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setKeyword(label);
              setTimeout(() => handleSearch({ preventDefault: () => {} } as React.FormEvent), 0);
            }}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-brand-400 hover:text-brand-600"
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-6">
        {results === null ? (
          <p className="py-10 text-center text-sm text-slate-400">
            输入关键词开始搜索
          </p>
        ) : results.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            没有找到「{keyword}」相关的内容
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              找到 {results.length} 个结果
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((work) => (
                <Link
                  key={work.id}
                  href={`/works/${work.id}`}
                  className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
                >
                  <div className="flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-brand-400 to-indigo-600">
                    {work.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={work.cover_url}
                        alt={work.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="line-clamp-3 px-1 text-xs font-bold text-white">
                        {work.title}
                      </span>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col justify-between py-0.5">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs text-brand-700">
                          {TYPE_LABEL[work.type ?? "novel"] ?? "小说"}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                          {work.category}
                        </span>
                      </div>
                      <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-brand-600">
                        {work.title}
                      </h3>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {work.description ?? "（暂无简介）"}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {work.author?.username ?? "佚名"} · {work.view_count} 阅读
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
