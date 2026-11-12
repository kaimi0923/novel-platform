import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PayoutRequestButton } from "@/components/payout-request-button";
import { MIN_PAYOUT, formatTwd } from "@/lib/pay-config";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  kind: string;
  amount: number;
  author_share: number;
  message: string | null;
  paid_at: string | null;
  work: { title: string } | null;
  chapter: { title: string } | null;
};

type PayoutRow = {
  id: string;
  amount: number;
  status: string;
  note: string | null;
  requested_at: string;
  handled_at: string | null;
};

export default async function EarningsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: ordersData } = await supabase
    .from("orders")
    .select(
      "id, kind, amount, author_share, message, paid_at, work:works(title), chapter:chapters(title)"
    )
    .eq("author_id", user.id)
    .eq("status", "paid")
    .order("paid_at", { ascending: false })
    .limit(200);

  const { data: payoutsData } = await supabase
    .from("payout_requests")
    .select("id, amount, status, note, requested_at, handled_at")
    .eq("author_id", user.id)
    .order("requested_at", { ascending: false })
    .limit(50);

  const orders = (ordersData ?? []) as unknown as OrderRow[];
  const payouts = (payoutsData ?? []) as unknown as PayoutRow[];

  const totalEarned = orders.reduce((s, o) => s + (o.author_share ?? 0), 0);
  const withdrawn = payouts
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);
  const pendingPayout = payouts
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);
  const available = totalEarned - withdrawn - pendingPayout;

  const tipTotal = orders
    .filter((o) => o.kind === "tip")
    .reduce((s, o) => s + o.author_share, 0);
  const chapterTotal = orders
    .filter((o) => o.kind === "chapter")
    .reduce((s, o) => s + o.author_share, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">收益中心</h1>
          <p className="mt-1 text-sm text-slate-500">
            章節銷售與讀者打賞 · 作者分潤 70%
          </p>
        </div>
        {user ? null : null}
        <PayoutRequestButton
          available={available}
          hasPending={pendingPayout > 0}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">累計收益</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatTwd(totalEarned)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">可提現餘額</p>
          <p className="mt-1 text-xl font-bold text-brand-600">
            {formatTwd(Math.max(available, 0))}
          </p>
          {pendingPayout > 0 && (
            <p className="mt-1 text-[11px] text-amber-600">
              另有 {formatTwd(pendingPayout)} 提現處理中
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">已提現</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatTwd(withdrawn)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
          章節銷售 {formatTwd(chapterTotal)}
        </div>
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          讀者打賞 {formatTwd(tipTotal)}
        </div>
      </div>

      {/* 收益明細 */}
      <h2 className="mt-8 text-base font-semibold text-slate-900">收益明細</h2>
      {orders.length === 0 ? (
        <p className="mt-3 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
          還沒有收益。章節設為付費、或讀者打賞後，這裡會出現紀錄。
        </p>
      ) : (
        <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {orders.map((o) => (
            <div key={o.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-800">
                  {o.kind === "chapter"
                    ? `章節購買 · ${o.work?.title ?? ""}〈${o.chapter?.title ?? ""}〉`
                    : `打賞 · ${o.work?.title ?? ""}`}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {o.paid_at
                    ? new Date(o.paid_at).toLocaleString("zh-TW", {
                        timeZone: "Asia/Taipei",
                      })
                    : ""}
                  {o.message ? ` · 「${o.message}」` : ""}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-emerald-600">
                +{formatTwd(o.author_share)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 提現紀錄 */}
      <h2 className="mt-8 text-base font-semibold text-slate-900">提現紀錄</h2>
      {payouts.length === 0 ? (
        <p className="mt-3 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
          還沒有提現申請（累計滿 {formatTwd(MIN_PAYOUT)} 可申請）
        </p>
      ) : (
        <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-slate-800">{formatTwd(p.amount)}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {new Date(p.requested_at).toLocaleString("zh-TW", {
                    timeZone: "Asia/Taipei",
                  })}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  p.status === "paid"
                    ? "bg-emerald-50 text-emerald-600"
                    : p.status === "rejected"
                      ? "bg-rose-50 text-rose-600"
                      : "bg-amber-50 text-amber-600"
                }`}
              >
                {p.status === "paid" ? "已匯款" : p.status === "rejected" ? "已駁回" : "處理中"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link href="/dashboard" className="text-sm text-brand-600">
          ← 回作者中心
        </Link>
      </div>
    </div>
  );
}
