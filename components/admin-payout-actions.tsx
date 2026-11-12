"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminPayoutActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle(next: "paid" | "rejected") {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase
      .from("payout_requests")
      .update({
        status: next,
        handled_by: user?.id ?? null,
        handled_at: new Date().toISOString(),
      })
      .eq("id", id);
    setLoading(false);
    router.refresh();
  }

  if (status !== "pending") {
    return (
      <span className="text-xs font-medium text-slate-400">
        {status === "paid" ? "已匯款" : "已駁回"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => handle("paid")}
        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
      >
        已匯款
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => handle("rejected")}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 disabled:opacity-60"
      >
        駁回
      </button>
    </div>
  );
}
