import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyHistory } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  novel: "小說",
  art: "插畫",
  comic: "漫畫",
  drama: "短劇",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "剛剛";
  if (minutes < 60) return `${minutes} 分鐘前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小時前`;
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
          <h1 className="text-2xl font-bold text-slate-900">瀏覽記錄</h1>
          <p className="mt-1 text-sm text-slate-500">
            最近看過的作品，共 {items.length} 部
          </p>
        </div>
        <Link href="/dashboard" className="btn-secondary shrink-0">
          返回個人首頁
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500">還沒有瀏覽記錄</p>
          <p className="mt-1 text-xs text-slate-400">
            開啟任意作品後，會自動記錄在這裡
          </p>
          <Link href="/works" className="btn-primary mt-4">
            去書庫逛逛
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
                    無封面
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {w.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {TYPE_LABEL[w.type ?? "novel"] ?? "小說"} · {w.category}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {(w.view_count ?? 0).toLocaleString("zh-CN")} 閱讀 · 收藏{" "}
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
