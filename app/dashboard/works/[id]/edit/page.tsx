"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/constants";
import { Work } from "@/lib/types";

export default function EditWorkPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const workId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

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
          const work = data as Work;
          setTitle(work.title);
          setCategory(work.category);
          setDescription(work.description ?? "");
          setCoverUrl(work.cover_url ?? "");
        }
        setLoading(false);
      });
  }, [workId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createClient();
    // 只更新信息字段，不动审核状态
    const { error } = await supabase
      .from("works")
      .update({
        title: title.trim(),
        description: description.trim() || null,
        category,
        cover_url: coverUrl.trim() || null,
      })
      .eq("id", workId);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (loading) {
    return <p className="px-4 py-20 text-center text-sm text-slate-400">加载中…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">编辑作品</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            作品名称 <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={50}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-base"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            分类 <span className="text-rose-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-base"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            作品简介
          </label>
          <textarea
            rows={5}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-base resize-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            封面图片链接
          </label>
          <input
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://…"
            className="input-base"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "保存中…" : "保存修改"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            取消
          </button>
        </div>
        <p className="text-xs text-slate-400">
          * 已通过审核的作品修改信息后，状态保持不变
        </p>
      </form>
    </div>
  );
}
