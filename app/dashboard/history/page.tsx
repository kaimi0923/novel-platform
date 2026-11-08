import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyHistory } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  novel: "小说",
  art: "插画",
  comic: "漫画",
  drama: "短剧",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(iso).toLocaleDateString("zh-CN");
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const items = await getMyHistory(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">浏览记录</h1>
          <p className="mt-1 text-sm text-slate-500">
            最近看过的作品，共 {items.length} 部
          </p>
        </div>
        <Link href="/dashboard" className="btn-secondary shrink-0">
          返回个人首页
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500">还没有浏览记录</p>
          <p className="mt-1 text-xs text-slate-400">
            打开任意作品后，会自动记录在这里
          </p>
          <Link href="/works" className="btn-primary mt-4">
            去书库逛逛
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((w) => (
            <Link
              key={w.id}
              href={`/works/${w.id}`}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300"
            >
              <div className="h-[92px] w-[66px] shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {w.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={w.cover_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    无封面
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {w.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {TYPE_LABEL[w.type ?? "novel"] ?? "小说"} · {w.category}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {(w.view_count ?? 0).toLocaleString("zh-CN")} 阅读 · 收藏{" "}
                  {(w.favorite_count ?? 0).toLocaleString("zh-CN")}
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                {timeAgo(w.viewed_at)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
