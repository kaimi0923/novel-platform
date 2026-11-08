"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminReportActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(next: "resolved" | "dismissed") {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("content_reports")
      .update({ status: next })
      .eq("id", id);
    setLoading(false);
    if (!error) router.refresh();
  }

  if (status === "resolved") {
    return <span className="text-xs font-medium text-emerald-600">已處理</span>;
  }
  if (status === "dismissed") {
    return <span className="text-xs font-medium text-slate-400">已駁回</span>;
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => update("resolved")}
        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
      >
        標為已處理
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => update("dismissed")}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 disabled:opacity-60"
      >
        駁回
      </button>
    </div>
  );
}
