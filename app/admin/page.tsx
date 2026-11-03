import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPendingWorks } from "@/lib/supabase/queries";
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-900">审核后台</h1>
      <p className="mt-1 text-sm text-stone-500">
        待审核作品 {pendingWorks.length} 本，请先审后发
      </p>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-3 border-b border-stone-200 pb-3">
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            待审核
          </span>
          <Link href="/admin/approved" className="text-sm text-stone-500 transition hover:text-brand-600">
            已通过
          </Link>
          <Link href="/admin/rejected" className="text-sm text-stone-500 transition hover:text-brand-600">
            已驳回
          </Link>
        </div>

        {pendingWorks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <p className="text-stone-500">暂无待审核作品，全部处理完了</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingWorks.map((work) => (
              <div
                key={work.id}
                className="rounded-xl border border-stone-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-500">
                        {work.category}
                      </span>
                      <span className="text-xs text-stone-400">
                        投稿于 {new Date(work.created_at).toLocaleString("zh-CN")}
                      </span>
                    </div>
                    <Link
                      href={`/works/${work.id}`}
                      className="text-lg font-semibold text-stone-900 transition hover:text-brand-600"
                    >
                      {work.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-stone-500">
                      作者：{work.author?.username ?? "佚名"} · {work.chapter_count ?? 0} 章
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-stone-600">
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
