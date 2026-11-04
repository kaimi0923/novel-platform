import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminVerifyActions from "@/components/admin-verify-actions";
import IdPhotoView from "@/components/id-photo-view";

export const dynamic = "force-dynamic";

export default async function AdminVerifyPage() {
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

  // 待审核的实名认证申请
  const { data: pendingList } = await supabase
    .from("profiles")
    .select("id, username, email, real_name, id_number, id_address, id_photo_url, created_at")
    .eq("verify_status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">实名认证审核</h1>
      <p className="mt-1 text-sm text-slate-500">
        待审核申请 {pendingList?.length ?? 0} 条，核对真实信息后点击通过或驳回
      </p>

      <div className="mt-6">
        <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-3">
          <Link href="/admin" className="text-sm text-slate-500 transition hover:text-brand-600">
            作品审核
          </Link>
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            实名认证
          </span>
        </div>

        {(!pendingList || pendingList.length === 0) ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">暂无待审核的实名认证申请</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingList.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {p.username ?? "未设置昵称"}
                    </p>
                    <p className="text-xs text-slate-400">{p.email}</p>
                  </div>
                  <AdminVerifyActions profileId={p.id} />
                </div>

                <dl className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">真实姓名</dt>
                    <dd className="font-medium text-slate-900">{p.real_name ?? "—"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">证件号码</dt>
                    <dd className="font-medium text-slate-900">{p.id_number ?? "—"}</dd>
                  </div>
                  {p.id_address && (
                    <div className="flex items-center justify-between gap-4 sm:col-span-2">
                      <dt className="shrink-0 text-slate-500">证件地址</dt>
                      <dd className="text-right font-medium text-slate-900">
                        {p.id_address}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4 sm:col-span-2">
                    <dt className="shrink-0 text-slate-500">证件照片</dt>
                    <dd>
                      {p.id_photo_url ? (
                        <IdPhotoView path={p.id_photo_url} />
                      ) : (
                        <span className="text-xs text-slate-400">未上传</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
