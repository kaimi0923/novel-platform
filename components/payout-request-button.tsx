"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MIN_PAYOUT, formatTwd } from "@/lib/pay-config";

export function PayoutRequestButton({
  available,
  hasPending,
}: {
  available: number;
  hasPending: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(Math.max(available, 0)));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const canRequest = available >= MIN_PAYOUT && !hasPending;

  async function submit() {
    const value = parseInt(amount, 10);
    if (!Number.isInteger(value) || value < MIN_PAYOUT) {
      setError(`最低提現金額為 ${formatTwd(MIN_PAYOUT)}`);
      return;
    }
    if (value > available) {
      setError("提現金額超過可提現餘額");
      return;
    }
    setSaving(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setError("請重新登入");
      return;
    }
    const { error: err } = await supabase.from("payout_requests").insert({
      author_id: user.id,
      amount: value,
      note: note.trim() || null,
      status: "pending",
    });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (!canRequest) {
    return (
      <div className="text-xs text-slate-400">
        {hasPending
          ? "已有一筆提現申請在處理中"
          : `累計滿 ${formatTwd(MIN_PAYOUT)} 才能申請提現`}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary !py-2 text-sm"
      >
        申請提現
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            {done ? (
              <>
                <h3 className="text-base font-semibold text-slate-900">申請已送出</h3>
                <p className="mt-2 text-sm text-slate-500">
                  平台會在 7 個工作日內處理，匯款完成後狀態會更新為「已匯款」。
                </p>
                <button type="button" onClick={() => setOpen(false)} className="btn-primary mt-4 w-full">
                  關閉
                </button>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-slate-900">申請提現</h3>
                <p className="mt-1 text-xs text-slate-400">
                  可提現餘額 {formatTwd(available)}
                </p>
                <label className="mt-3 block text-xs text-slate-500">提現金額</label>
                <input
                  type="number"
                  min={MIN_PAYOUT}
                  max={available}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-base mt-1 !py-2 text-sm"
                />
                <label className="mt-3 block text-xs text-slate-500">
                  收款資訊（銀行代碼 / 帳號 / 戶名）
                </label>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="例如：808 玉山銀行 0000-123-456789 林○○"
                  className="input-base mt-1 resize-none text-sm"
                />
                {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={saving}
                    className="btn-primary flex-1 disabled:opacity-60"
                  >
                    {saving ? "送出中…" : "送出申請"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
