import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyStats } from "@/lib/supabase/queries";
import { STATUS_LABEL, STATUS_COLOR } from "@/lib/constants";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  novel: "小說",
  art: "插畫",
  comic: "漫畫",
  drama: "短劇",
};

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const stats = await getMyStats(user.id);

  const cards = [
    { label: "作品總數", value: stats.workCount },
    { label: "已釋出", value: stats.approvedCount },
    { label: "待稽核", value: stats.pendingCount },
    { label: "未透過", value: stats.rejectedCount },
    { label: "總閱讀", value: stats.totalViews },
    { label: "總收藏", value: stats.totalFavorites },
    { label: "粉絲", value: stats.followerCount },
    { label: "關注", value: stats.followingCount },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">資料分析</h1>
          <p className="mt-1 text-sm text-slate-500">
            你的作品表現與讀者情況
          </p>
        </div>
        <Link href="/dashboard" className="btn-secondary shrink-0">
          返回個人首頁
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-slate-200 bg-white px-4 py-4"
          >
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {c.value.toLocaleString("zh-CN")}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            作品表現排行
          </h2>
          <span className="text-xs text-slate-400">按閱讀量排序</span>
        </div>

        {stats.works.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">還沒有作品</p>
            <Link href="/dashboard/works/new" className="btn-primary mt-4">
              投一部作品
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="hidden grid-cols-[1fr_72px_80px_72px_72px] gap-3 border-b border-slate-100 px-4 py-2.5 text-xs text-slate-400 sm:grid">
              <span>作品</span>
              <span>型別</span>
              <span>狀態</span>
              <span className="text-right">閱讀</span>
              <span className="text-right">收藏</span>
            </div>
            {stats.works.map((w) => (
              <div
                key={w.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0 sm:grid-cols-[1fr_72px_80px_72px_72px]"
              >
                <Link
                  href={`/works/${w.id}`}
                  className="truncate text-sm font-medium text-slate-900 hover:text-brand-600"
                >
                  {w.title}
                </Link>
                <span className="text-xs text-slate-500">
                  {TYPE_LABEL[w.type ?? "novel"] ?? "小說"}
                </span>
                <span
                  className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    STATUS_COLOR[w.status] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {STATUS_LABEL[w.status] ?? w.status}
                </span>
                <span className="text-right text-xs text-slate-600">
                  {(w.view_count ?? 0).toLocaleString("zh-CN")}
                </span>
                <span className="text-right text-xs text-slate-600">
                  {(w.favorite_count ?? 0).toLocaleString("zh-CN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
