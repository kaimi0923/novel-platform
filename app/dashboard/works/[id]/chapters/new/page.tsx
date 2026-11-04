"use client";

import { useEffect, useRef, useState } from "react";
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
  // 章节插图：本地待上传文件 + 预览地址
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

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

  function onPickImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    // 校验类型与大小（JPG/PNG/WebP，单张 ≤5MB）
    for (const f of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
        setError("只支持 JPG / PNG / WebP 格式的图片");
        e.target.value = "";
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setError(`图片「${f.name}」超过 5MB，请压缩后重试`);
        e.target.value = "";
        return;
      }
    }
    setError(null);
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  }

  function removeImage(i: number) {
    setImageFiles((prev) => prev.filter((_, j) => j !== i));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[i]);
      return prev.filter((_, j) => j !== i);
    });
  }

  /** 在正文光标位置插入 [插图N] 标记 */
  function insertImageMarker(i: number) {
    const marker = `[插图${i + 1}]`;
    const ta = contentRef.current;
    const start = ta?.selectionStart ?? content.length;
    const end = ta?.selectionEnd ?? content.length;
    const next = content.slice(0, start) + marker + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      ta?.focus();
      const pos = start + marker.length;
      ta?.setSelectionRange(pos, pos);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    // 上传插图到存储（文件名带时间戳，避免浏览器缓存旧图）
    let uploadedImages: string[] = [];
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("请先登录");

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const path = `chapter-images/${user.id}-${Date.now()}-${i}`;
        const { error: upErr } = await supabase.storage
          .from("author-images")
          .upload(path, file, { upsert: false, cacheControl: "3600" });
        if (upErr) throw new Error(upErr.message);
        uploadedImages.push(
          supabase.storage.from("author-images").getPublicUrl(path).data.publicUrl
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "图片上传失败");
      setLoading(false);
      return;
    }

    // 查询当前最大章节序号
    const { data: last } = await supabase
      .from("chapters")
      .select("chapter_order")
      .eq("work_id", workId)
      .order("chapter_order", { ascending: false })
      .limit(1);

    const nextOrder = last && last.length > 0 ? last[0].chapter_order + 1 : 1;

    const isArt = work?.type === "art";
    const isVisual = work?.type === "art" || work?.type === "comic";

    // 插画/漫画作品必须至少上传一张图片
    if (isVisual && uploadedImages.length === 0) {
      setError("请至少上传一张作品图片");
      setLoading(false);
      return;
    }

    // 插画：标题选填，默认"插图 N"；插画/漫画正文都留空（只放图片）
    const finalTitle = title.trim() || (isArt ? `插图 ${nextOrder}` : "");
    const finalContent = isVisual ? "" : content.trim();

    const { error } = await supabase.from("chapters").insert({
      work_id: workId,
      title: finalTitle,
      content: finalContent,
      chapter_order: nextOrder,
      images: uploadedImages,
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
          className="text-sm text-slate-500 transition hover:text-brand-600"
        >
          ← 返回我的作品
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">添加章节</h1>
        {work && (
          <p className="mt-1 text-sm text-slate-500">
            作品：《{work.title}》
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            章节标题{" "}
            {work?.type === "art" ? (
              <span className="font-normal text-slate-400">（选填，可不填）</span>
            ) : (
              <span className="text-rose-500">*</span>
            )}
          </label>
          <input
            type="text"
            required={work?.type !== "art"}
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              work?.type === "art"
                ? "如：月光下的少女（插画名，可不填）"
                : "如：第一章 相遇"
            }
            className="input-base"
          />
        </div>

        {/* 插画/漫画作品：只放图片，不出现文字框；小说保留正文 */}
        {work?.type === "art" || work?.type === "comic" ? (
          <div className="rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-xs text-sky-700">
            {work?.type === "art"
              ? "插画作品只放图片：直接上传下方图片即可，无需输入文字。"
              : "漫画作品只放图片：直接上传下方图片即可（多张图按顺序阅读），无需输入文字。"}
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              正文 <span className="text-rose-500">*</span>
            </label>
            <textarea
              ref={contentRef}
              required
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"在这里写正文……\n\n想插入插图的位置，写 [插图1] [插图2]…（对应下方选的第几张图）\n段落之间请空一行，方便阅读。"}
              className="input-base resize-y font-serif leading-7"
            />
          </div>
        )}

        {/* 章节插图（可选） */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {work?.type === "art" || work?.type === "comic" ? (
              <>
                作品图片 <span className="font-normal text-slate-400">（必传，可从相簿选择）</span>
              </>
            ) : (
              <>
                章节插图 <span className="font-normal text-slate-400">（选填，可从相簿选择多张）</span>
              </>
            )}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={onPickImages}
          />
          {imagePreviews.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-8 text-slate-400 transition hover:border-brand-400 hover:text-brand-600"
            >
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.5-3.5L11 18" />
                <path d="M12 8v6M9 11h6" />
              </svg>
              <span className="text-sm">点击从相簿选择图片（支持多选）</span>
              <span className="text-xs text-slate-400">JPG / PNG / WebP，单张不超过 5MB</span>
            </button>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {imagePreviews.map((url, i) => (
                  <div
                    key={i}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`插图${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white transition hover:bg-rose-600"
                      aria-label="删除该插图"
                    >
                      删除
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                      插图 {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => insertImageMarker(i)}
                      className="absolute bottom-1.5 right-1.5 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-medium text-white transition hover:bg-brand-700"
                      aria-label="插入到正文"
                    >
                      插入正文
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-brand-400 hover:text-brand-600"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="text-xs">继续添加</span>
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                共 {imageFiles.length} 张 · 点「插入正文」把标记放进正文（或自己写 [插图1] [插图2]…），保存后图片会显示在对应位置
              </p>
            </>
          )}
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
