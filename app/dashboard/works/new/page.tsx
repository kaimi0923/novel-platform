"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CONTENT_RATINGS, SIMPLE_CONTENT_RATINGS, AI_USAGE_OPTIONS } from "@/lib/constants";
import { TagPicker } from "@/components/tag-picker";
import VerifyGate from "@/components/verify-gate";

export default function NewWorkPage() {
  const router = useRouter();
  const [workType, setWorkType] = useState<"novel" | "art" | "comic" | "drama">("novel");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rating, setRating] = useState<string>("general");
  const [aiUsage, setAiUsage] = useState<string>("");
  const [authorNote, setAuthorNote] = useState("");
  const [adultDeclared, setAdultDeclared] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("封面只支援 JPG / PNG / WebP 格式");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("封面圖片超過 5MB，請壓縮後重試");
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
    if (!aiUsage) {
      setError("請先選擇「作品製作方式」（AI 製作情形為必填）");
      return;
    }
    if (rating === "restricted" && !adultDeclared) {
      setError("發布限制級作品前，請先勾選成人內容合規聲明");
      return;
    }
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("請先登入");
      setLoading(false);
      return;
    }

    // 上傳封面（檔名帶時間戳，避免瀏覽器快取舊圖）
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
      setError(err instanceof Error ? err.message : "封面上傳失敗");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("works").insert({
      author_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      author_note: authorNote.trim() || null,
      ai_usage: aiUsage,
      category,
      cover_url: finalCover,
      tags,
      type: workType,
      is_completed: isCompleted,
      content_rating: rating,
      adult_declared_at:
        rating === "restricted" ? new Date().toISOString() : null,
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
        <h1 className="mb-6 text-2xl font-bold text-slate-900">釋出新作品</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            作品型別 <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                { key: "novel", label: "小說", desc: "文字作品" },
                { key: "art", label: "插畫", desc: "單張圖片" },
                { key: "comic", label: "漫畫", desc: "圖片作品" },
                { key: "drama", label: "短劇", desc: "豎屏影片劇集" },
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
          {workType === "drama" && (
            <p className="mt-2 text-xs text-amber-600">
              短劇建立後會進入稽核；透過後在「新增劇集」頁逐集上傳影片（豎屏 9:16 最佳，單集建議 1–3 分鐘、50MB 以內）
            </p>
          )}
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              內容分級 <span className="text-rose-500">*</span>
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="input-base"
            >
              {(workType === "drama" ? CONTENT_RATINGS : SIMPLE_CONTENT_RATINGS).map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}｜{r.desc}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-400">
              {workType === "drama"
                ? "短劇依《電腦網路內容分級處理辦法》分五級；選「限制級」時，未滿 18 歲者會先被年齡確認頁擋下。"
                : "小說／漫畫／插畫只需分「普遍級」與「限制級」；選限制級時，未滿 18 歲者會被擋在年齡確認頁，並需勾選下方合規聲明。"}
            </p>
            {rating === "restricted" && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/70 p-3">
                <label className="flex items-start gap-2 text-xs leading-relaxed text-rose-800">
                  <input
                    type="checkbox"
                    checked={adultDeclared}
                    onChange={(e) => setAdultDeclared(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-rose-600"
                  />
                  <span>
                    我確認本作品不含性器官裸露、性行為特寫、性暴力或性虐待等硬蕊內容，
                    不含任何未滿 18 歲人物之性相關內容，且所用人物影像均已取得合法授權。
                    若違反，平台有權直接下架並停權，相關法律責任由我自行承擔。
                    我已閱讀並同意
                    <a
                      href="/creator-agreement"
                      target="_blank"
                      rel="noreferrer"
                      className="mx-1 font-medium underline"
                    >
                      《成人內容創作規範》
                    </a>
                    。
                  </span>
                </label>
              </div>
            )}
          </div>
          {(workType === "art" || workType === "comic") && (
            <p className="mt-2 text-xs text-amber-600">
              插畫/漫畫作品請務必上傳作品圖（封面），讀者以圖片形式瀏覽
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            作品名稱 <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={50}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="給作品起個名字"
            className="input-base"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            分類 <span className="text-rose-500">*</span>
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
            作品簡介
          </label>
          <textarea
            rows={5}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="簡單介紹一下你的故事（500 字以內）"
            className="input-base resize-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            作者的話 <span className="font-normal text-slate-400">（選填）</span>
          </label>
          <textarea
            rows={3}
            maxLength={300}
            value={authorNote}
            onChange={(e) => setAuthorNote(e.target.value)}
            placeholder="想對讀者說的話，例如創作緣起、連載安排…（300 字以內）"
            className="input-base resize-none"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            會顯示在作品頁的「作者的話」區塊，讀者可見。
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            作品製作方式 <span className="text-rose-500">*</span>
          </label>
          <select
            value={aiUsage}
            onChange={(e) => setAiUsage(e.target.value)}
            className="input-base"
          >
            <option value="">請選擇（必填）</option>
            {AI_USAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}｜{o.desc}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-slate-400">
            依平台規範，作品是否使用 AI 製作需向讀者揭露，選項會顯示在作品頁。
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            封面圖片 <span className="font-normal text-slate-400">（選填，可從相簿選擇）</span>
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
                alt="封面預覽"
                className="mx-auto max-h-64 rounded-xl border border-slate-200 object-contain"
              />
              <div className="mt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="btn-secondary !py-1.5 text-xs"
                >
                  更換圖片
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
              <span className="text-sm">點選從相簿選擇封面</span>
              <span className="text-xs text-slate-400">
                {workType === "drama"
                  ? "短劇請上傳豎版封面（9:16），JPG / PNG / WebP，≤5MB"
                  : workType === "novel"
                    ? "小說封面建議豎版（3:4），JPG / PNG / WebP，≤5MB"
                    : "插畫/漫畫請上傳作品圖"}
              </span>
            </button>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            作品標籤 <span className="text-slate-400">（選填，最多 12 個）</span>
          </label>
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <TagPicker value={tags} onChange={setTags} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            連載狀態
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: false, label: "連載中", desc: "還在更新" },
              { key: true, label: "已完結", desc: "全書完結" },
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
            {loading ? "提交中…" : "提交稽核"}
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
          * 提交後作品進入稽核佇列，透過後才會在書庫展示
        </p>
      </form>
      </div>
    </VerifyGate>
  );
}
