import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorksByStatus } from "@/lib/supabase/queries";
import { STATUS_LABEL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminRejectedPage() {
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

  const works = await getWorksByStatus("rejected");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-900">已驳回的作品</h1>
      <p className="mt-1 text-sm text-stone-500">共 {works.length} 本</p>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-3 border-b border-stone-200 pb-3">
          <Link href="/admin" className="text-sm text-stone-500 transition hover:text-brand-600">
            待审核
          </Link>
          <Link href="/admin/approved" className="text-sm text-stone-500 transition hover:text-brand-600">
            已通过
          </Link>
          <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800">
            已驳回
          </span>
        </div>

        <div className="space-y-3">
          {works.map((work) => (
            <div
              key={work.id}
              className="rounded-xl border border-stone-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/works/${work.id}`}
                    className="font-semibold text-stone-900 transition hover:text-brand-600"
                  >
                    {work.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {work.category} · 作者：{work.author?.username ?? "佚名"}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800">
                  {STATUS_LABEL[work.status]}
                </span>
              </div>
              {work.reject_reason && (
                <p className="mt-2 rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-700">
                  驳回原因：{work.reject_reason}
                </p>
              )}
            </div>
          ))}
          {works.length === 0 && (
            <p className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
              还没有被驳回的作品
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
