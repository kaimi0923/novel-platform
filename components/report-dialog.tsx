"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { REPORT_REASONS } from "@/lib/constants";

export function ReportDialog({
  workId,
  workTitle,
}: {
  workId: string;
  workTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [detail, setDetail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setSending(true);
    setErr("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("content_reports").insert({
      work_id: workId,
      reporter_id: user?.id ?? null,
      reason,
      detail: detail.trim() || null,
    });
    setSending(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setDone(true);
    setDetail("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setDone(false);
        }}
        className="text-xs text-slate-400 underline decoration-slate-300 underline-offset-2 transition hover:text-rose-500"
      >
        舉報此作品
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {done ? (
              <>
                <h3 className="text-base font-semibold text-slate-900">已收到檢舉</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  我們會在 24 小時內完成初步檢視。若內容涉及未成年人性影像，
                  將立即下架並通報主管機關。感謝你協助維護平台安全。
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
                  舉報《{workTitle}》
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  請選擇最接近的原因，我們會人工確認。
                </p>

                <div className="mt-4 space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        reason === r
                          ? "border-rose-300 bg-rose-50 text-rose-800"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="mt-0.5 accent-rose-600"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>

                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="補充說明（選填）：哪一章、哪張圖、什麼問題"
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
                    {sending ? "送出中…" : "送出檢舉"}
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
