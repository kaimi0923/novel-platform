import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminReportActions } from "@/components/admin-report-actions";
import { RATING_LABEL } from "@/lib/constants";

export const dynamic = "force-dynamic";

type ReportRow = {
  id: string;
  work_id: string;
  reason: string;
  detail: string | null;
  status: string;
  created_at: string;
  work: {
    id: string;
    title: string;
    content_rating: string | null;
  } | null;
};

export default async function AdminReportsPage() {
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
    .from("content_reports")
    .select(
      "id, work_id, reason, detail, status, created_at, work:works(id, title, content_rating)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const reports = (data ?? []) as unknown as ReportRow[];
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">檢舉處理</h1>
          <p className="mt-1 text-sm text-slate-500">
            待處理 {pendingCount} 件 · 依《電腦網路內容分級處理辦法》與著作權法處理
          </p>
        </div>
        <Link href="/admin" className="text-sm text-brand-600">
          ← 回稽核後臺
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          檢舉資料表尚未建立。請先在 Supabase SQL Editor 執行
          <span className="mx-1 font-mono text-xs">supabase/schema.sql</span>
          第 21 節，再重新整理本頁。
        </div>
      )}

      {!error && reports.length === 0 && (
        <p className="mt-10 text-center text-sm text-slate-400">
          目前沒有檢舉紀錄
        </p>
      )}

      <div className="mt-6 space-y-3">
        {reports.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {r.work?.title ?? "（作品已刪除）"}
                  {r.work?.content_rating && (
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-normal text-slate-500">
                      {RATING_LABEL[r.work.content_rating] ?? r.work.content_rating}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {new Date(r.created_at).toLocaleString("zh-TW", {
                    timeZone: "Asia/Taipei",
                  })}
                </p>
              </div>
              <AdminReportActions id={r.id} status={r.status} />
            </div>

            <p className="mt-2 text-sm text-slate-700">原因：{r.reason}</p>
            {r.detail && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-500">
                {r.detail}
              </p>
            )}

            {r.work?.id && (
              <Link
                href={`/drama/${r.work.id}`}
                className="mt-2 inline-block text-xs text-brand-600"
              >
                前往作品頁查看 →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
