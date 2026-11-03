"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Work } from "@/lib/types";

export default function NewChapterPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const workId = params.id;

  const [work, setWork] = useState<Work | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("works")
      .select("*")
      .eq("id", workId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError("作品不存在或无权访问");
        } else {
          setWork(data as Work);
        }
      });
  }, [workId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    // 查询当前最大章节序号
    const { data: last } = await supabase
      .from("chapters")
      .select("chapter_order")
      .eq("work_id", workId)
      .order("chapter_order", { ascending: false })
      .limit(1);

    const nextOrder = last && last.length > 0 ? last[0].chapter_order + 1 : 1;

    const { error } = await supabase.from("chapters").insert({
      work_id: workId,
      title: title.trim(),
      content: content.trim(),
      chapter_order: nextOrder,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(`/works/${workId}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-stone-500 transition hover:text-brand-600"
        >
          ← 返回我的作品
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">添加章节</h1>
        {work && (
          <p className="mt-1 text-sm text-stone-500">
            作品：《{work.title}》
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">
            章节标题 <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：第一章 相遇"
            className="input-base"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">
            正文 <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"在这里写正文……\n\n段落之间请空一行，方便阅读。"}
            className="input-base resize-y font-serif leading-7"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "保存中…" : "保存章节"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
