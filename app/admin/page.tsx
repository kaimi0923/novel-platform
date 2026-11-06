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

  // 仅管理员可访问
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
      <h1 className="text-2xl font-bold text-slate-900">审核后台</h1>
      <p className="mt-1 text-sm text-slate-500">
        待审核作品 {pendingWorks.length} 本，请先审后发
      </p>

      {/* 数据总览 */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "会员总数",
            value: overview.memberCount,
            hint: `今日新增 ${overview.todayNewMembers}`,
          },
          {
            label: "作家 / 作者",
            value: overview.authorCount,
            hint: `纯读者 ${overview.readerCount}`,
          },
          {
            label: "作品总数",
            value: overview.totalWorks,
            hint: `已通过 ${overview.approvedWorks} · 待审 ${overview.pendingWorks}`,
          },
          {
            label: "总阅读量",
            value: overview.totalViews,
            hint: `收藏 ${overview.favoriteCount}`,
          },
          {
            label: "关注关系",
            value: overview.followCount,
            hint: "读者关注作者的总数",
          },
          {
            label: "待实名审核",
            value: overview.pendingVerify,
            hint: "需要处理",
          },
          {
            label: "已驳回作品",
            value: overview.rejectedWorks,
            hint: "",
          },
          {
            label: "管理员",
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
            待审核
          </span>
          <Link href="/admin/approved" className="text-sm text-slate-500 transition hover:text-brand-600">
            已通过
          </Link>
          <Link href="/admin/rejected" className="text-sm text-slate-500 transition hover:text-brand-600">
            已驳回
          </Link>
          <Link href="/admin/verify" className="text-sm text-slate-500 transition hover:text-brand-600">
            实名认证
          </Link>
          <Link
            href="/admin/members"
            className="text-sm font-medium text-brand-600 transition hover:text-brand-700"
          >
            会员与作家 →
          </Link>
        </div>

        {pendingWorks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">暂无待审核作品，全部处理完了</p>
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
                        投稿于 {new Date(work.created_at).toLocaleString("zh-CN")}
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
                      {work.description ?? "（无简介）"}
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
