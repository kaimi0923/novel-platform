"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminWorkActions({
  workId,
  title,
}: {
  workId: string;
  title: string;
}) {
  const router = useRouter();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function approve() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("works")
      .update({ status: "approved", reject_reason: null })
      .eq("id", workId);
    if (error) setError(error.message);
    router.refresh();
    setLoading(false);
  }

  async function reject() {
    if (!rejectReason.trim()) {
      setError("请填写驳回原因，方便作者修改");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("works")
      .update({ status: "rejected", reject_reason: rejectReason.trim() })
      .eq("id", workId);
    if (error) setError(error.message);
    router.refresh();
    setLoading(false);
    setShowRejectInput(false);
    setRejectReason("");
  }

  return (
    <div className="mt-3 border-t border-stone-100 pt-3">
      {showRejectInput ? (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="驳回原因（会展示给作者）"
            className="input-base resize-none !text-xs"
          />
          <div className="flex gap-2">
            <button
              onClick={reject}
              disabled={loading}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
            >
              确认驳回
            </button>
            <button
              onClick={() => {
                setShowRejectInput(false);
                setRejectReason("");
                setError(null);
              }}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-600"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={approve}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            通过
          </button>
          <button
            onClick={() => setShowRejectInput(true)}
            disabled={loading}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
          >
            驳回
          </button>
        </div>
      )}
      {error && (
        <p className="mt-2 text-xs text-rose-600">{error}</p>
      )}
      <p className="mt-2 hidden text-xs text-stone-400">《{title}》</p>
    </div>
  );
}
