"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Work } from "@/lib/types";

export default function NewEpisodePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const workId = params.id;

  const [work, setWork] = useState<Work | null>(null);
  const [existing, setExisting] = useState<{ id: string; episode_order: number }[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("works")
      .select("*")
      .eq("id", workId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setError("作品不存在或无权访问");
        else setWork(data as Work);
      });
    supabase
      .from("episodes")
      .select("id, episode_order")
      .eq("work_id", workId)
      .order("episode_order", { ascending: true })
      .then(({ data }) => setExisting(data ?? []));
  }, [workId]);

  function onPickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setError("请选择视频文件（mp4 / mov）");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError("视频超过 50MB，请压缩或剪短到 1-3 分钟再上传");
      return;
    }
    setError(null);
    setDuration(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("请先选择视频");
      return;
    }
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const nextOrder =
      existing.length > 0
        ? Math.max(...existing.map((x) => x.episode_order)) + 1
        : 1;

    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `drama/${workId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("drama-videos")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw new Error(upErr.message);

      const { data: pub } = supabase.storage
        .from("drama-videos")
        .getPublicUrl(path);

      const { error: insErr } = await supabase.from("episodes").insert({
        work_id: workId,
        episode_order: nextOrder,
        title: title.trim() || `第 ${nextOrder} 集`,
        video_url: pub.publicUrl,
        cover_url: work?.cover_url ?? null,
        duration,
      });
      if (insErr) throw new Error(insErr.message);

      router.push(`/drama/${workId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 transition hover:text-brand-600"
        >
          ← 返回我的作品
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">上传剧集</h1>
        {work && (
          <p className="mt-1 text-sm text-slate-500">
            短剧：《{work.title}》 · 已有 {existing.length} 集
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            视频 <span className="text-rose-500">*</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={onPickVideo}
          />

          {previewUrl ? (
            <div>
              <video
                src={previewUrl}
                controls
                playsInline
                onLoadedMetadata={(e) =>
                  setDuration(Math.round(e.currentTarget.duration))
                }
                className="mx-auto max-h-[60vh] rounded-xl bg-black"
              />
              <div className="mt-2 flex items-center justify-center gap-3 text-xs text-slate-500">
                <span>{file?.name}</span>
                {duration && <span>时长 {duration} 秒</span>}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary !px-3 !py-1.5 !text-xs"
                >
                  重新选择
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-10 text-slate-400 transition hover:border-brand-400 hover:text-brand-600"
            >
              <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m10 4 2 4 2-4" />
                <path d="M10 14l5-3-5-3z" />
              </svg>
              <span className="text-sm">点击从相簿选择视频</span>
              <span className="text-xs text-slate-400">
                MP4 / MOV，单集 ≤50MB（约 1–3 分钟）
              </span>
            </button>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            本集标题 <span className="text-slate-400">（选填）</span>
          </label>
          <input
            type="text"
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：第 1 集 意外重逢"
            className="input-base"
          />
          <p className="mt-1 text-xs text-slate-400">
            不填会自动命名为「第 N 集」
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "上传中…" : "上传这一集"}
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
          * 一集一集传，传完可继续传下一集。审核通过后读者才能看到。
        </p>
      </form>
    </div>
  );
}
