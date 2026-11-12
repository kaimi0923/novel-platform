import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminAppealActions } from "@/components/admin-appeal-actions";

export const dynamic = "force-dynamic";

type AppealRow = {
  id: string;
  work_id: string;
  reason: string;
  status: string;
  created_at: string;
  work: { id: string; title: string; status: string } | null;
  author: { username: string | null } | null;
};

export default async function AdminAppealsPage() {
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
    .from("work_appeals")
    .select(
      "id, work_id, reason, status, created_at, work:works(id, title, status), author:profiles!work_appeals_author_id_fkey(username)"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const appeals = (data ?? []) as unknown as AppealRow[];
  const pendingCount = appeals.filter((a) => a.status === "pending").length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">申訴處理</h1>
          <p className="mt-1 text-sm text-slate-500">
            待處理 {pendingCount} 件 · 作者對下架處分提出之申訴
          </p>
        </div>
        <Link href="/admin" className="text-sm text-brand-600">
          ← 回稽核後臺
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          申訴資料表尚未建立。請先在 Supabase SQL Editor 執行建表語法，再重新整理本頁。
        </div>
      )}

      {!error && appeals.length === 0 && (
        <p className="mt-10 text-center text-sm text-slate-400">目前沒有申訴紀錄</p>
      )}

      <div className="mt-6 space-y-3">
        {appeals.map((a) => (
          <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {a.work?.title ?? "（作品已刪除）"}
                  <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-normal text-slate-500">
                    {a.work?.status === "approved" ? "已上架" : "已下架"}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {a.author?.username ?? "未知作者"} ·{" "}
                  {new Date(a.created_at).toLocaleString("zh-TW", {
                    timeZone: "Asia/Taipei",
                  })}
                </p>
              </div>
              <AdminAppealActions id={a.id} workId={a.work_id} status={a.status} />
            </div>

            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
              {a.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
