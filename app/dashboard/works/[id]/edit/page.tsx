"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/constants";
import { Work } from "@/lib/types";
import { TagPicker } from "@/components/tag-picker";
import VerifyGate from "@/components/verify-gate";

export default function EditWorkPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const workId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workType, setWorkType] = useState<"novel" | "art" | "comic">("novel");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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
          setWorkType(work.type ?? "novel");
          setTitle(work.title);
          setCategory(work.category);
          setDescription(work.description ?? "");
          setCoverUrl(work.cover_url ?? "");
          setTags(work.tags ?? []);
        }
        setLoading(false);
      });
  }, [workId]);

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
    setCoverUrl("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createClient();

    // 上传新封面（文件名带时间戳，避免浏览器缓存旧图）
    let finalCover: string | null = coverUrl || null;
    try {
      if (coverFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("请先登录");
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
      setSaving(false);
      return;
    }

    // 只更新信息字段，不动审核状态
    const { error } = await supabase
      .from("works")
      .update({
        title: title.trim(),
        description: description.trim() || null,
        category,
        cover_url: finalCover,
        tags,
        type: workType,
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
    <VerifyGate>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">编辑作品</h1>

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
            封面图片 <span className="font-normal text-slate-400">（可从相簿选择）</span>
          </label>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onPickCover}
          />
          {coverPreview || coverUrl ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverPreview ?? coverUrl}
                alt="封面预览"
                className="mx-auto max-h-64 rounded-xl border border-slate-200 object-contain"
              />
              <div className="mt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="btn-secondary !py-1.5 text-xs"
                >
                  {coverFile ? "重新选择" : "更换图片"}
                </button>
                <button
                  type="button"
                  onClick={removeCover}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-400 transition hover:border-rose-300 hover:text-rose-600"
                >
                  移除封面
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
              <span className="text-xs text-slate-400">JPG / PNG / WebP，≤5MB</span>
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
    </VerifyGate>
  );
}
