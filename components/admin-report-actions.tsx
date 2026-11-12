"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminReportActions({
  id,
  workId,
  status,
}: {
  id: string;
  workId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function mark(next: "resolved" | "dismissed") {
    setLoading(true);
    setErr("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("content_reports")
      .update({
        status: next,
        handled_by: user?.id ?? null,
        handled_at: new Date().toISOString(),
        action_note: next === "resolved" ? "已確認處理" : "經檢視未違規，駁回",
      })
      .eq("id", id);
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    router.refresh();
  }

  async function takeDown() {
    if (!confirm("確定要立即下架這個作品？作者會看到「違規下架」狀態。")) return;
    setLoading(true);
    setErr("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const now = new Date().toISOString();

    const { error: workErr } = await supabase
      .from("works")
      .update({
        status: "rejected",
        reject_reason: "經檢舉確認違規，平台逕行下架",
        reviewed_by: user?.id ?? null,
        reviewed_at: now,
      })
      .eq("id", workId);

    if (workErr) {
      setLoading(false);
      setErr(workErr.message);
      return;
    }

    await supabase
      .from("content_reports")
      .update({
        status: "resolved",
        handled_by: user?.id ?? null,
        handled_at: now,
        action_note: "已下架作品",
      })
      .eq("id", id);

    setLoading(false);
    router.refresh();
  }

  if (status === "resolved") {
    return <span className="text-xs font-medium text-emerald-600">已處理</span>;
  }
  if (status === "dismissed") {
    return <span className="text-xs font-medium text-slate-400">已駁回</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={takeDown}
        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
      >
        立即下架作品
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => mark("resolved")}
        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
      >
        標為已處理
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => mark("dismissed")}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 disabled:opacity-60"
      >
        駁回
      </button>
      {err && <span className="text-xs text-rose-600">{err}</span>}
    </div>
  );
}
