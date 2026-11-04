"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** 管理员审核实名认证：通过 / 驳回 */
export default function AdminVerifyActions({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "approve" | "reject" | "reset">(null);
  const [error, setError] = useState<string | null>(null);

  async function run(status: "approved" | "rejected" | "pending") {
    setBusy(status === "approved" ? "approve" : status === "rejected" ? "reject" : "reset");
    setError(null);
    const supabase = createClient();
    const { error: upErr } = await supabase
      .from("profiles")
      .update({ verify_status: status })
      .eq("id", profileId);
    if (upErr) {
      setError(upErr.message);
      setBusy(null);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => run("approved")}
        className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {busy === "approve" ? "处理中…" : "通过"}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => run("rejected")}
        className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
      >
        {busy === "reject" ? "处理中…" : "驳回"}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => run("pending")}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
      >
        退回待审核
      </button>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
