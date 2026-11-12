"use client";

import { useState } from "react";
import Link from "next/link";
import { formatTwd } from "@/lib/pay-config";

/**
 * 章節購買牆：未購買時只露出前幾段，其餘遮住
 */
export function BuyChapter({
  chapterId,
  title,
  price,
  loggedIn,
  workId,
}: {
  chapterId: string;
  title: string;
  price: number;
  loggedIn: boolean;
  workId: string;
}) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-6 py-8 text-center sm:px-10">
      <div className="mx-auto max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
          🔒
        </div>
        <h2 className="mt-3 text-lg font-semibold text-slate-900">
          本章為付費章節
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          〈{title}〉 售價{" "}
          <span className="font-semibold text-amber-700">{formatTwd(price)}</span>
          ，購買後可永久閱讀。
        </p>

        {loggedIn ? (
          <form
            method="post"
            action="/api/ecpay/checkout"
            className="mt-5 space-y-3 text-left"
          >
            <input type="hidden" name="kind" value="chapter" />
            <input type="hidden" name="chapterId" value={chapterId} />
            <input type="hidden" name="workId" value={workId} />
            <input type="hidden" name="amount" value={price} />
            <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                我已確認購買的是〈{title}〉單章閱讀權限，數位內容一經解鎖恕不退款。
              </span>
            </label>
            <button
              type="submit"
              disabled={!agreed}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              付款 {formatTwd(price)} 解鎖本章
            </button>
            <p className="text-center text-[11px] text-slate-400">
              由綠界科技 ECPay 提供安全付款（信用卡 / ATM / 超商代碼）
            </p>
          </form>
        ) : (
          <div className="mt-5 space-y-2">
            <Link
              href={`/login?next=/read/${workId}/${chapterId}`}
              className="btn-primary block w-full"
            >
              登入後購買
            </Link>
            <p className="text-center text-[11px] text-slate-400">
              未登入無法購買付費章節
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
