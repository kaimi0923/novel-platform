"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AppealDialog({
  workId,
  workTitle,
}: {
  workId: string;
  workTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    if (!reason.trim()) {
      setErr("請簡要說明你認為不應下架的理由");
      return;
    }
    setSending(true);
    setErr("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSending(false);
      setErr("請先登入");
      return;
    }
    const { error } = await supabase.from("work_appeals").insert({
      work_id: workId,
      author_id: user.id,
      reason: reason.trim(),
    });
    setSending(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setDone(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setDone(false);
        }}
        className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
      >
        提出申訴
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {done ? (
              <>
                <h3 className="text-base font-semibold text-slate-900">申訴已送出</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  我們會在 7 個工作日內重新檢視《{workTitle}》。若判斷為誤判，
                  會恢復上架並通知你；若維持下架，也會在後台顯示原因。
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-primary mt-4 w-full"
                >
                  關閉
                </button>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-slate-900">
                  對《{workTitle}》提出申訴
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  請說明你認為作品未違規的依據，例如：分級標示正確、內容為軟性成人向、
                  已取得授權等。
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="請描述具體情況…"
                  className="input-base mt-3 resize-none text-sm"
                />
                {err && <p className="mt-2 text-sm text-rose-600">{err}</p>}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn-secondary flex-1"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={sending}
                    className="btn-primary flex-1 disabled:opacity-60"
                  >
                    {sending ? "送出中…" : "送出申訴"}
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
