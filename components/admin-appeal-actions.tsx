"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminAppealActions({
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

  async function handle(next: "approved" | "rejected") {
    setLoading(true);
    setErr("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const now = new Date().toISOString();

    if (next === "approved") {
      const { error: workErr } = await supabase
        .from("works")
        .update({
          status: "approved",
          reject_reason: null,
          reviewed_by: user?.id ?? null,
          reviewed_at: now,
        })
        .eq("id", workId);
      if (workErr) {
        setLoading(false);
        setErr(workErr.message);
        return;
      }
    }

    await supabase
      .from("work_appeals")
      .update({
        status: next,
        handled_by: user?.id ?? null,
        handled_at: now,
        note: next === "approved" ? "申訴成立，已恢復上架" : "維持下架",
      })
      .eq("id", id);

    setLoading(false);
    router.refresh();
  }

  if (status === "approved") {
    return <span className="text-xs font-medium text-emerald-600">已恢復上架</span>;
  }
  if (status === "rejected") {
    return <span className="text-xs font-medium text-slate-400">已維持下架</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => handle("approved")}
        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
      >
        恢復上架
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => handle("rejected")}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 disabled:opacity-60"
      >
        維持下架
      </button>
      {err && <span className="text-xs text-rose-600">{err}</span>}
    </div>
  );
}
