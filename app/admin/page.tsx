import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPendingWorks, getAdminOverview } from "@/lib/supabase/queries";
import { AdminWorkActions } from "@/components/admin-work-actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 僅管理員可訪問
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const pendingWorks = await getPendingWorks();
  const overview = await getAdminOverview();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">稽核後臺</h1>
      <p className="mt-1 text-sm text-slate-500">
        待稽核作品 {pendingWorks.length} 本，請先審後發
      </p>

      {/* 資料總覽 */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "會員總數",
            value: overview.memberCount,
            hint: `今日新增 ${overview.todayNewMembers}`,
          },
          {
            label: "作家 / 作者",
            value: overview.authorCount,
            hint: `純讀者 ${overview.readerCount}`,
          },
          {
            label: "作品總數",
            value: overview.totalWorks,
            hint: `已透過 ${overview.approvedWorks} · 待審 ${overview.pendingWorks}`,
          },
          {
            label: "總閱讀量",
            value: overview.totalViews,
            hint: `收藏 ${overview.favoriteCount}`,
          },
          {
            label: "關注關係",
            value: overview.followCount,
            hint: "讀者關注作者的總數",
          },
          {
            label: "待實名稽核",
            value: overview.pendingVerify,
            hint: "需要處理",
          },
          {
            label: "已駁回作品",
            value: overview.rejectedWorks,
            hint: "",
          },
          {
            label: "管理員",
            value: overview.adminCount,
            hint: "",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-2xl font-bold text-slate-900">
              {s.value.toLocaleString("zh-CN")}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
            {s.hint && (
              <p className="mt-0.5 text-[11px] text-slate-400">{s.hint}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-3">
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            待稽核
          </span>
          <Link href="/admin/approved" className="text-sm text-slate-500 transition hover:text-brand-600">
            已透過
          </Link>
          <Link href="/admin/rejected" className="text-sm text-slate-500 transition hover:text-brand-600">
            已駁回
          </Link>
          <Link href="/admin/verify" className="text-sm text-slate-500 transition hover:text-brand-600">
            實名認證
          </Link>
          <Link href="/admin/reports" className="text-sm text-slate-500 transition hover:text-brand-600">
            檢舉處理
          </Link>
          <Link
            href="/admin/members"
            className="text-sm font-medium text-brand-600 transition hover:text-brand-700"
          >
            會員與作家 →
          </Link>
        </div>

        {pendingWorks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">暫無待稽核作品，全部處理完了</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingWorks.map((work) => (
              <div
                key={work.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                        {work.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        投稿於 {new Date(work.created_at).toLocaleString("zh-CN")}
                      </span>
                    </div>
                    <Link
                      href={`/works/${work.id}`}
                      className="text-lg font-semibold text-slate-900 transition hover:text-brand-600"
                    >
                      {work.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      作者：{work.author?.username ?? "佚名"} · {work.chapter_count ?? 0} 章
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {work.description ?? "（無簡介）"}
                    </p>
                  </div>
                </div>
                <AdminWorkActions workId={work.id} title={work.title} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
