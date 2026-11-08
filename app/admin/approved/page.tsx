import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorksByStatus } from "@/lib/supabase/queries";
import { STATUS_LABEL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminApprovedPage() {
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

  const works = await getWorksByStatus("approved");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">已透過的作品</h1>
      <p className="mt-1 text-sm text-slate-500">共 {works.length} 本</p>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-3">
          <Link href="/admin" className="text-sm text-slate-500 transition hover:text-brand-600">
            待稽核
          </Link>
          <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
            已透過
          </span>
          <Link href="/admin/rejected" className="text-sm text-slate-500 transition hover:text-brand-600">
            已駁回
          </Link>
        </div>

        <div className="space-y-3">
          {works.map((work) => (
            <div
              key={work.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/works/${work.id}`}
                  className="font-semibold text-slate-900 transition hover:text-brand-600"
                >
                  {work.title}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500">
                  {work.category} · 作者：{work.author?.username ?? "佚名"} ·{" "}
                  {work.chapter_count ?? 0} 章 · {work.view_count} 閱讀
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                {STATUS_LABEL[work.status]}
              </span>
            </div>
          ))}
          {works.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              還沒有已透過的作品
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
