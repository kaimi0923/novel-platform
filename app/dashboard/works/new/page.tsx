"use client";

import { useRef, useState } from "react";
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
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("封面只支持 JPG / PNG / WebP 格式");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("封面图片超过 5MB，请压缩后重试");
      e.target.value = "";
      return;
    }
    setError(null);
    setCoverFile(file);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  function removeCover() {
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
  }

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

    // 上传封面（文件名带时间戳，避免浏览器缓存旧图）
    let finalCover: string | null = null;
    try {
      if (coverFile) {
        const coverPath = `covers/${user.id}-${Date.now()}`;
        const { error: upErr } = await supabase.storage
          .from("author-images")
          .upload(coverPath, coverFile, { upsert: false, cacheControl: "3600" });
        if (upErr) throw new Error(upErr.message);
        finalCover = supabase.storage
          .from("author-images")
          .getPublicUrl(coverPath).data.publicUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "封面上传失败");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("works").insert({
      author_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      category,
      cover_url: finalCover,
      tags,
      type: workType,
      is_completed: isCompleted,
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
              插画/漫画作品请务必上传作品图（封面），读者以图片形式浏览
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
            封面图片 <span className="font-normal text-slate-400">（选填，可从相簿选择）</span>
          </label>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onPickCover}
          />
          {coverPreview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverPreview}
                alt="封面预览"
                className="mx-auto max-h-64 rounded-xl border border-slate-200 object-contain"
              />
              <div className="mt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="btn-secondary !py-1.5 text-xs"
                >
                  更换图片
                </button>
                <button
                  type="button"
                  onClick={removeCover}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-400 transition hover:border-rose-300 hover:text-rose-600"
                >
                  移除
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-8 text-slate-400 transition hover:border-brand-400 hover:text-brand-600"
            >
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.5-3.5L11 18" />
                <path d="M12 8v6M9 11h6" />
              </svg>
              <span className="text-sm">点击从相簿选择封面</span>
              <span className="text-xs text-slate-400">
                {workType !== "novel" ? "插画/漫画请上传作品图" : "小说封面建议竖版（3:4），JPG / PNG / WebP，≤5MB"}
              </span>
            </button>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            作品标签 <span className="text-slate-400">（选填，最多 12 个）</span>
          </label>
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <TagPicker value={tags} onChange={setTags} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            连载状态
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: false, label: "连载中", desc: "还在更新" },
              { key: true, label: "已完结", desc: "全书完结" },
            ].map((s) => (
              <button
                key={String(s.key)}
                type="button"
                onClick={() => setIsCompleted(s.key)}
                className={`rounded-xl border p-3 text-left transition ${
                  isCompleted === s.key
                    ? "border-brand-600 bg-brand-50"
                    : "border-slate-200 bg-white hover:border-brand-300"
                }`}
              >
                <span
                  className={`block text-sm font-semibold ${
                    isCompleted === s.key ? "text-brand-700" : "text-slate-700"
                  }`}
                >
                  {s.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate-400">
                  {s.desc}
                </span>
              </button>
            ))}
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
