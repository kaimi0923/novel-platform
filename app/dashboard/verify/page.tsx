"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import { isValidIdNumber, maskName, maskId } from "@/lib/id-validator";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // 认证信息
  const [realName, setRealName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idAddress, setIdAddress] = useState("");
  const [idPhotoUrl, setIdPhotoUrl] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<Profile["verify_status"]>(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null);
  const [newIdPhoto, setNewIdPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);

  const submitted = verifyStatus === "pending" || verifyStatus === "approved";
  // 已提交且未编辑 → 只看；驳回/未提交/点编辑 → 表单
  const showForm = !submitted || editing;

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
        setRealName(p.real_name ?? "");
        setIdNumber(p.id_number ?? "");
        setIdAddress(p.id_address ?? "");
        setIdPhotoUrl(p.id_photo_url ?? null);
        setVerifyStatus(p.verify_status ?? null);
      }
      setLoading(false);
    })();
  }, [router]);

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setMessage({ type: "err", text: "仅支持 JPG / PNG / WebP 格式图片" });
      return;
    }
    if (file.size > MAX_SIZE) {
      setMessage({ type: "err", text: "图片大小不能超过 5MB" });
      return;
    }
    setNewIdPhoto(file);
    setIdPhotoPreview(URL.createObjectURL(file));
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const name = realName.trim();
    const idNo = idNumber.trim();
    if (name.length < 2) {
      setMessage({ type: "err", text: "请填写真实姓名" });
      return;
    }
    if (!isValidIdNumber(idNo)) {
      setMessage({
        type: "err",
        text: "证件号码格式不正确，请填写 18 位身份证 / 台湾居民居住证号码",
      });
      return;
    }
    // 证件照片必填：已有照片或本次新上传均可
    if (!idPhotoUrl && !newIdPhoto) {
      setMessage({ type: "err", text: "请上传证件照片，实名认证必须附证件照片" });
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

    let finalPhoto = idPhotoUrl;
    try {
      // 上传证件照片（私有桶，仅自己/管理员可见）
      if (newIdPhoto) {
        const photoPath = `docs/${user.id}-${Date.now()}`;
        const { error: upErr } = await supabase.storage
          .from("verify-docs")
          .upload(photoPath, newIdPhoto, { upsert: false, cacheControl: "3600" });
        if (upErr) throw new Error(upErr.message);
        finalPhoto = photoPath; // 私有桶存路径，展示时用签名 URL
      }

      // 保存认证信息并提交审核
      const { error } = await supabase
        .from("profiles")
        .update({
          real_name: name,
          id_number: idNo,
          id_address: idAddress.trim() || null,
          id_photo_url: finalPhoto,
          verify_status: "pending",
        })
        .eq("id", user.id);
      if (error) throw new Error(error.message);

      setRealName(name);
      setIdNumber(idNo);
      setIdPhotoUrl(finalPhoto);
      setVerifyStatus("pending");
      setNewIdPhoto(null);
      setIdPhotoPreview(null);
      setEditing(false);
      setMessage({ type: "ok", text: "已提交，等待管理员审核…" });
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
      <h1 className="mb-6 text-2xl font-bold text-slate-900">实名认证</h1>

      {/* 状态提示 */}
      {verifyStatus === "approved" && !editing && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            ✓
          </span>
          <div>
            <p className="font-semibold text-emerald-800">已完成实名认证</p>
            <p className="text-xs text-emerald-600">
              认证信息仅你自己和管理员可见，请放心
            </p>
          </div>
        </div>
      )}
      {verifyStatus === "pending" && !editing && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
            ⏳
          </span>
          <div>
            <p className="font-semibold text-amber-800">实名认证审核中</p>
            <p className="text-xs text-amber-600">
              已提交，管理员核实后会尽快处理，请耐心等待
            </p>
          </div>
        </div>
      )}
      {verifyStatus === "rejected" && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
            !
          </span>
          <div>
            <p className="font-semibold text-rose-800">实名认证未通过</p>
            <p className="text-xs text-rose-600">
              管理员未能核实提交的信息，请检查后重新提交
            </p>
          </div>
        </div>
      )}

      {showForm ? (
        /* 填写/重新提交表单 */
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              真实姓名 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder="与证件一致的姓名"
              className="input-base"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              证件号码 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="18 位身份证 / 台湾居民居住证号码"
              className="input-base"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              将校验号码格式，且需管理员审核通过后方算认证成功
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              证件地址
            </label>
            <input
              type="text"
              value={idAddress}
              onChange={(e) => setIdAddress(e.target.value)}
              placeholder="证件上的地址（选填）"
              className="input-base"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              证件照片 <span className="text-rose-500">*</span>
              <span className="text-slate-400">（仅管理员可见）</span>
            </label>
            <div
              className="flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center"
              style={
                idPhotoPreview
                  ? {
                      backgroundImage: `url(${idPhotoPreview})`,
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }
                  : undefined
              }
            >
              {!idPhotoPreview && (
                <span className="text-xs text-slate-400">
                  请上传证件正面照片（JPG/PNG，≤5MB）
                </span>
              )}
            </div>
            <input
              ref={photoInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onPickPhoto}
            />
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              className="btn-secondary mt-3 !py-2 text-sm"
            >
              {idPhotoPreview ? "重新选择" : "上传证件照片"}
            </button>
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
              {saving ? "保存中…" : verifyStatus === "rejected" ? "重新提交" : "提交认证"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (submitted) setEditing(false);
                else router.back();
              }}
              className="btn-secondary"
            >
              返回
            </button>
          </div>
          <p className="text-xs text-slate-400">
            * 提交后需管理员人工审核，通过后才会显示"已完成实名认证"
          </p>
        </form>
      ) : (
        /* 已提交展示（待审核/已通过） */
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">真实姓名</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {maskName(realName)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500">证件号码</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {maskId(idNumber)}
                </dd>
              </div>
              {idAddress && (
                <div className="flex items-center justify-between gap-6">
                  <dt className="shrink-0 text-sm text-slate-500">证件地址</dt>
                  <dd className="text-right text-sm font-medium text-slate-900">
                    {idAddress}
                  </dd>
                </div>
              )}
              {idPhotoUrl && <IdPhoto url={idPhotoUrl} />}
            </dl>
          </div>

          {verifyStatus === "pending" && (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setMessage(null);
              }}
              className="btn-secondary"
            >
              修改后重新提交
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** 证件照片展示（私有桶，用签名 URL 加载） */
function IdPhoto({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const supabase = createClient();
    supabase.storage
      .from("verify-docs")
      .createSignedUrl(url, 600)
      .then(({ data }) => {
        if (data) setSrc(data.signedUrl);
      });
  }, [url]);

  if (!src) {
    return (
      <div className="flex items-center justify-between">
        <dt className="text-sm text-slate-500">证件照片</dt>
        <dd className="text-xs text-slate-400">加载中…</dd>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-6">
      <dt className="shrink-0 text-sm text-slate-500">证件照片</dt>
      <dd>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="证件照片"
          className="h-24 w-36 rounded-lg border border-slate-200 object-cover"
        />
      </dd>
    </div>
  );
}
