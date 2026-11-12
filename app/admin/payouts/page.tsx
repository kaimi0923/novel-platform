import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPayoutActions } from "@/components/admin-payout-actions";
import { formatTwd } from "@/lib/pay-config";

export const dynamic = "force-dynamic";

type PayoutRow = {
  id: string;
  amount: number;
  status: string;
  note: string | null;
  requested_at: string;
  author: { username: string | null } | null;
};

export default async function AdminPayoutsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  const { data, error } = await supabase
    .from("payout_requests")
    .select(
      "id, amount, status, note, requested_at, author:profiles!payout_requests_author_id_fkey(username)"
    )
    .order("requested_at", { ascending: false })
    .limit(100);

  const payouts = (data ?? []) as unknown as PayoutRow[];
  const pendingCount = payouts.filter((p) => p.status === "pending").length;
  const pendingAmount = payouts
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">提現處理</h1>
          <p className="mt-1 text-sm text-slate-500">
            待處理 {pendingCount} 筆 · 合計 {formatTwd(pendingAmount)}
          </p>
        </div>
        <Link href="/admin" className="text-sm text-brand-600">
          ← 回稽核後臺
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          提現資料表尚未建立，請先在 Supabase SQL Editor 執行建表語法。
        </div>
      )}

      {!error && payouts.length === 0 && (
        <p className="mt-10 text-center text-sm text-slate-400">目前沒有提現申請</p>
      )}

      <div className="mt-6 space-y-3">
        {payouts.map((p) => (
          <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {p.author?.username ?? "未知作者"} · {formatTwd(p.amount)}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {new Date(p.requested_at).toLocaleString("zh-TW", {
                    timeZone: "Asia/Taipei",
                  })}
                </p>
              </div>
              <AdminPayoutActions id={p.id} status={p.status} />
            </div>
            {p.note && (
              <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                收款資訊：{p.note}
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-slate-400">
        提醒：匯款完成後再點「已匯款」，系統會自動計入作者的「已提現」。建議保留匯款截圖作為憑證。
      </p>
    </div>
  );
}
