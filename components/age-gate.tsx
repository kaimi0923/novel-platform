"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Phase = "loading" | "ok" | "login" | "birth" | "denied" | "confirm";

function ageFrom(birthday: string): number {
  const d = new Date(birthday);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

/**
 * 限制級（18+）年齡確認
 * 規則：必須登入 + 個人資料已填生日 + 實際年滿 18 歲，才會放行
 */
export function AgeGate({
  workId,
  rating,
  backHref = "/",
  backLabel = "返回",
  children,
}: {
  workId: string;
  rating?: string | null;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}) {
  const adult = rating === "restricted";
  const [phase, setPhase] = useState<Phase>(adult ? "loading" : "ok");
  const [birthday, setBirthday] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!adult) return;
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setPhase("login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("birthday")
        .eq("id", user.id)
        .single();
      const b = (profile as { birthday?: string | null } | null)?.birthday ?? null;
      if (!b) {
        setPhase("birth");
        return;
      }
      if (ageFrom(b) < 18) {
        setPhase("denied");
        return;
      }
      setPhase(localStorage.getItem(`age_ok_${workId}`) === "1" ? "ok" : "confirm");
    })();
  }, [adult, workId]);

  async function saveBirthday() {
    if (!birthday) {
      setErr("請選擇生日");
      return;
    }
    setSaving(true);
    setErr("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setPhase("login");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ birthday })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      setErr(error.message);
      return;
    }
    if (ageFrom(birthday) < 18) {
      setPhase("denied");
      return;
    }
    setPhase("confirm");
  }

  if (phase === "ok") return <>{children}</>;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">
        18+ 限制級
      </span>
      <h1 className="text-xl font-bold text-slate-900">此內容為限制級</h1>

      {phase === "loading" && (
        <p className="text-sm text-slate-400">正在確認年齡資格…</p>
      )}

      {phase === "login" && (
        <>
          <p className="text-sm leading-relaxed text-slate-500">
            依台灣《電腦網路內容分級處理辦法》，未滿 18 歲者不得瀏覽本內容。
            請先登入，我們會依你資料中的生日確認年齡。
          </p>
          <Link href="/login" className="btn-primary w-full max-w-xs">
            登入後繼續
          </Link>
        </>
      )}

      {phase === "birth" && (
        <>
          <p className="text-sm leading-relaxed text-slate-500">
            為了確認你是否年滿 18 歲，請填寫生日（只會用來判斷年齡，不會公開）。
          </p>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="input-base text-center"
          />
          {err && <p className="text-sm text-rose-600">{err}</p>}
          <button
            type="button"
            onClick={saveBirthday}
            disabled={saving}
            className="btn-primary w-full max-w-xs disabled:opacity-60"
          >
            {saving ? "儲存中…" : "儲存並繼續"}
          </button>
        </>
      )}

      {phase === "denied" && (
        <>
          <p className="text-base font-semibold text-slate-800">
            你目前未滿 18 歲
          </p>
          <p className="text-sm leading-relaxed text-slate-500">
            依規定無法瀏覽限制級內容。若生日填寫有誤，可到「個人資料」頁修正。
          </p>
          <Link href="/dashboard/profile" className="btn-secondary w-full max-w-xs">
            修改生日
          </Link>
        </>
      )}

      {phase === "confirm" && (
        <>
          <p className="text-sm leading-relaxed text-slate-500">
            你已年滿 18 歲，可以瀏覽本內容。點擊下方按鈕表示你理解並自願觀看，
            且不會將內容轉傳給未成年人。
          </p>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(`age_ok_${workId}`, "1");
              setPhase("ok");
            }}
            className="btn-primary w-full max-w-xs"
          >
            我已滿 18 歲，繼續瀏覽
          </button>
        </>
      )}

      <Link href={backHref} className="text-sm text-slate-400 transition hover:text-slate-600">
        {backLabel}
      </Link>
    </div>
  );
}
