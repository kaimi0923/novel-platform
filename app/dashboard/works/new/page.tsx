"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/constants";
import { TagPicker } from "@/components/tag-picker";
import VerifyGate from "@/components/verify-gate";

export default function NewWorkPage() {
  const router = useRouter();
  const [workType, setWorkType] = useState<"novel" | "art" | "comic">("novel");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("请先登录");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("works").insert({
      author_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      category,
      cover_url: coverUrl.trim() || null,
      tags,
      type: workType,
      status: "pending",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <VerifyGate>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">发布新作品</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            作品类型 <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { key: "novel", label: "小说", desc: "文字作品" },
                { key: "art", label: "插画", desc: "单张图片" },
                { key: "comic", label: "漫画", desc: "图片作品" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setWorkType(t.key)}
                className={`rounded-xl border p-3 text-left transition ${
                  workType === t.key
                    ? "border-brand-600 bg-brand-50"
                    : "border-slate-200 bg-white hover:border-brand-300"
                }`}
              >
                <span className={`block text-sm font-semibold ${workType === t.key ? "text-brand-700" : "text-slate-700"}`}>
                  {t.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate-400">{t.desc}</span>
              </button>
            ))}
          </div>
          {workType !== "novel" && (
            <p className="mt-2 text-xs text-amber-600">
              插画/漫画作品请务必填写封面图片链接（作品图），读者以图片形式浏览
            </p>
          )}
        </div>

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
            placeholder="给作品起个名字"
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
            placeholder="简单介绍一下你的故事（500 字以内）"
            className="input-base resize-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            封面图片链接（选填）
          </label>
          <input
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://…（不填则自动用文字封面）"
            className="input-base"
          />
          <p className="mt-1 text-xs text-slate-400">
            可先不填，后续编辑作品时再补充
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            作品标签 <span className="text-slate-400">（选填，最多 12 个）</span>
          </label>
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <TagPicker value={tags} onChange={setTags} />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "提交中…" : "提交审核"}
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
          * 提交后作品进入审核队列，通过后才会在书库展示
        </p>
      </form>
      </div>
    </VerifyGate>
  );
}
