"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

function checkFile(file: File): string | null {
  if (!ALLOWED.includes(file.type)) return "僅支援 JPG / PNG / WebP 格式圖片";
  if (file.size > MAX_SIZE) return "圖片大小不能超過 5MB";
  return null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  // 聯絡方式
  const [qq, setQq] = useState("");
  const [wechat, setWechat] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [birthday, setBirthday] = useState("");
  // 待上傳的新檔案（選了但還沒儲存）
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
        setQq(p.qq ?? "");
        setWechat(p.wechat ?? "");
        setContactEmail(p.contact_email ?? "");
        setContactPhone(p.contact_phone ?? "");
        setShippingAddress(p.shipping_address ?? "");
        setBirthday((p as Profile & { birthday?: string | null }).birthday ?? "");
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
      setMessage({ type: "err", text: "暱稱長度需在 2-20 個字元之間" });
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage({ type: "err", text: "請先登入" });
      setSaving(false);
      return;
    }

    let finalAvatar = avatarUrl;
    let finalCover = coverUrl;

    try {
      // 上傳新頭像（檔名帶時間戳，避免瀏覽器快取舊圖）
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

      // 上傳新封面
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

      // 儲存檔案
      const { error } = await supabase
        .from("profiles")
        .update({
          username: name,
          avatar_url: finalAvatar,
          cover_url: finalCover,
          qq: qq.trim() || null,
          wechat: wechat.trim() || null,
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
          shipping_address: shippingAddress.trim() || null,
          birthday: birthday || null,
        })
        .eq("id", user.id);
      if (error) throw new Error(error.message);

      setAvatarUrl(finalAvatar);
      setCoverUrl(finalCover);
      setNewAvatar(null);
      setNewCover(null);
      setPreviewAvatar(null);
      setPreviewCover(null);
      setMessage({ type: "ok", text: "儲存成功！" });
      router.refresh();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "儲存失敗" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="px-4 py-20 text-center text-sm text-slate-400">載入中…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">個人檔案</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 個人封面橫幅 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            個人頁面封面
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
                上傳一張橫幅封面（建議寬度 1200px 以上）
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
            {previewCover || coverUrl ? "更換封面" : "上傳封面"}
          </button>
        </div>

        {/* 頭像 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            個人頭像
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
                {previewAvatar || avatarUrl ? "更換頭像" : "上傳頭像"}
              </button>
              <p className="mt-2 text-xs text-slate-400">
                支援 JPG、PNG、WebP，大小不超過 5MB
              </p>
            </div>
          </div>
        </div>

        {/* 生日（限制級內容年齡確認用，不對外顯示） */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            生日 <span className="font-normal text-slate-400">（僅用於年齡確認，不會公開）</span>
          </label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="input-base"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            瀏覽限制級（18+）作品時，系統會依此判斷是否年滿 18 歲。
          </p>
        </div>

        {/* 暱稱 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            暱稱
          </label>
          <input
            type="text"
            maxLength={20}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="你的筆名 / 暱稱"
            className="input-base"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            暱稱會顯示在作品詳情頁、留言區和人氣榜上
          </p>
        </div>

        {/* 聯絡方式（僅自己可見） */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <label className="mb-3 block text-sm font-medium text-slate-700">
            聯絡方式
          </label>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-600">QQ 號碼</label>
              <input
                type="text"
                value={qq}
                onChange={(e) => setQq(e.target.value)}
                placeholder="你的 QQ 號碼"
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">微訊號碼</label>
              <input
                type="text"
                value={wechat}
                onChange={(e) => setWechat(e.target.value)}
                placeholder="你的微訊號"
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">電子郵箱</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="用於接收通知的郵箱"
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">緊急聯絡方式</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="手機號碼"
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">我的收貨地址</label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="用於接收實體禮物/獎品"
                className="input-base"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            聯絡方式僅儲存在你自己帳號下，不會公開展示
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
            {saving ? "儲存中…" : "儲存修改"}
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
