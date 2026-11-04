"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

function checkFile(file: File): string | null {
  if (!ALLOWED.includes(file.type)) return "仅支持 JPG / PNG / WebP 格式图片";
  if (file.size > MAX_SIZE) return "图片大小不能超过 5MB";
  return null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  // 待上传的新文件（选了但还没保存）
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [newCover, setNewCover] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      const p = profile as Profile | null;
      if (p) {
        setUsername(p.username ?? "");
        setAvatarUrl(p.avatar_url ?? null);
        setCoverUrl(p.cover_url ?? null);
      }
      setLoading(false);
    })();
  }, [router]);

  function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = checkFile(file);
    if (err) {
      setMessage({ type: "err", text: err });
      return;
    }
    setNewAvatar(file);
    setPreviewAvatar(URL.createObjectURL(file));
    setMessage(null);
  }

  function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = checkFile(file);
    if (err) {
      setMessage({ type: "err", text: err });
      return;
    }
    setNewCover(file);
    setPreviewCover(URL.createObjectURL(file));
    setMessage(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const name = username.trim();
    if (name.length < 2 || name.length > 20) {
      setMessage({ type: "err", text: "昵称长度需在 2-20 个字符之间" });
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage({ type: "err", text: "请先登录" });
      setSaving(false);
      return;
    }

    let finalAvatar = avatarUrl;
    let finalCover = coverUrl;

    try {
      // 上传新头像（文件名带时间戳，避免浏览器缓存旧图）
      if (newAvatar) {
        const avatarPath = `avatars/${user.id}-${Date.now()}`;
        const { error: upErr } = await supabase.storage
          .from("author-images")
          .upload(avatarPath, newAvatar, { upsert: false, cacheControl: "3600" });
        if (upErr) throw new Error(upErr.message);
        finalAvatar = supabase.storage
          .from("author-images")
          .getPublicUrl(avatarPath).data.publicUrl;
      }

      // 上传新封面
      if (newCover) {
        const coverPath = `covers/${user.id}-${Date.now()}`;
        const { error: upErr } = await supabase.storage
          .from("author-images")
          .upload(coverPath, newCover, { upsert: false, cacheControl: "3600" });
        if (upErr) throw new Error(upErr.message);
        finalCover = supabase.storage
          .from("author-images")
          .getPublicUrl(coverPath).data.publicUrl;
      }

      // 保存档案
      const { error } = await supabase
        .from("profiles")
        .update({ username: name, avatar_url: finalAvatar, cover_url: finalCover })
        .eq("id", user.id);
      if (error) throw new Error(error.message);

      setAvatarUrl(finalAvatar);
      setCoverUrl(finalCover);
      setNewAvatar(null);
      setNewCover(null);
      setPreviewAvatar(null);
      setPreviewCover(null);
      setMessage({ type: "ok", text: "保存成功！" });
      router.refresh();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "保存失败" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="px-4 py-20 text-center text-sm text-slate-400">加载中…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">个人档案</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 个人封面横幅 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            个人页面封面
          </label>
          <div
            className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 text-center"
            style={{
              backgroundImage: previewCover
                ? `url(${previewCover})`
                : coverUrl
                  ? `url(${coverUrl})`
                  : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!previewCover && !coverUrl && (
              <span className="text-xs font-medium text-white/90">
                上传一张横幅封面（建议宽度 1200px 以上）
              </span>
            )}
          </div>
          <input
            ref={coverInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onPickCover}
          />
          <button
            type="button"
            onClick={() => coverInput.current?.click()}
            className="btn-secondary mt-3 !py-2 text-sm"
          >
            {previewCover || coverUrl ? "更换封面" : "上传封面"}
          </button>
        </div>

        {/* 头像 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            个人头像
          </label>
          <div className="flex items-center gap-5">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-2xl font-bold text-white"
              style={{
                backgroundImage: previewAvatar
                  ? `url(${previewAvatar})`
                  : avatarUrl
                    ? `url(${avatarUrl})`
                    : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {!previewAvatar && !avatarUrl && (
                <span className="text-xl">{username.slice(0, 1).toUpperCase() || "?"}</span>
              )}
            </div>
            <div>
              <input
                ref={avatarInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onPickAvatar}
              />
              <button
                type="button"
                onClick={() => avatarInput.current?.click()}
                className="btn-secondary !py-2 text-sm"
              >
                {previewAvatar || avatarUrl ? "更换头像" : "上传头像"}
              </button>
              <p className="mt-2 text-xs text-slate-400">
                支持 JPG、PNG、WebP，大小不超过 5MB
              </p>
            </div>
          </div>
        </div>

        {/* 昵称 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            昵称
          </label>
          <input
            type="text"
            maxLength={20}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="你的笔名 / 昵称"
            className="input-base"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            昵称会显示在作品详情页、留言区和人气榜上
          </p>
        </div>

        {message && (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              message.type === "ok"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {message.text}
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
            返回
          </button>
        </div>
      </form>
    </div>
  );
}
