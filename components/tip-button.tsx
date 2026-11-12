"use client";

import { useState } from "react";
import Link from "next/link";
import { TIP_PRESETS, TIP_MIN, TIP_MAX, formatTwd } from "@/lib/pay-config";

export function TipButton({
  workId,
  workTitle,
  loggedIn,
  isAuthor,
}: {
  workId: string;
  workTitle: string;
  loggedIn: boolean;
  isAuthor: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(TIP_PRESETS[1]);
  const [custom, setCustom] = useState("");
  const [message, setMessage] = useState("");

  const finalAmount = custom ? Number(custom) : amount;
  const valid =
    Number.isInteger(finalAmount) && finalAmount >= TIP_MIN && finalAmount <= TIP_MAX;

  if (isAuthor) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
      >
        ☕ 打賞作者
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">打賞作者</h3>
                <p className="mt-0.5 text-xs text-slate-400">支持《{workTitle}》繼續創作</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="關閉"
              >
                ✕
              </button>
            </div>

            {loggedIn ? (
              <form method="post" action="/api/ecpay/checkout" className="mt-4 space-y-3">
                <input type="hidden" name="kind" value="tip" />
                <input type="hidden" name="workId" value={workId} />
                <input type="hidden" name="amount" value={valid ? finalAmount : ""} />
                <input type="hidden" name="message" value={message} />

                <div className="grid grid-cols-4 gap-2">
                  {TIP_PRESETS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        setAmount(v);
                        setCustom("");
                      }}
                      className={`rounded-xl border py-2 text-sm font-medium transition ${
                        !custom && amount === v
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-slate-200 text-slate-600 hover:border-amber-300"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">自訂</span>
                  <input
                    type="number"
                    min={TIP_MIN}
                    max={TIP_MAX}
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder={`${TIP_MIN}–${TIP_MAX}`}
                    className="input-base !py-2 text-sm"
                  />
                  <span className="text-xs text-slate-400">元</span>
                </div>

                <input
                  type="text"
                  maxLength={120}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="想對作者說的話（選填，會公開顯示）"
                  className="input-base !py-2 text-sm"
                />

                <p className="text-center text-xs text-slate-500">
                  本次打賞 <span className="font-semibold text-amber-700">{valid ? formatTwd(finalAmount) : "—"}</span>
                </p>

                <button
                  type="submit"
                  disabled={!valid}
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  前往付款
                </button>
                <p className="text-center text-[11px] text-slate-400">
                  由綠界科技 ECPay 收款 · 作者可得 70%
                </p>
              </form>
            ) : (
              <div className="mt-4 space-y-2">
                <Link href={`/login?next=/works/${workId}`} className="btn-primary block w-full">
                  登入後打賞
                </Link>
                <p className="text-center text-[11px] text-slate-400">打賞需要先登入</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
