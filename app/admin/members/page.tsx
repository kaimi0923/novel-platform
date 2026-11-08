import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminMembers } from "@/lib/supabase/queries";
import { AdminMemberList } from "@/components/admin-member-list";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
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

  const members = await getAdminMembers();
  const authorCount = members.filter((m) => m.workCount > 0).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">會員與作家</h1>
          <p className="mt-1 text-sm text-slate-500">
            註冊會員 {members.length} 人 · 有作品的作家 {authorCount} 人 · 待實名稽核{" "}
            {members.filter((m) => m.verify_status === "pending").length} 人
          </p>
        </div>
        <Link href="/admin" className="btn-secondary shrink-0">
          返回稽核後臺
        </Link>
      </div>

      <AdminMemberList members={members} />
    </div>
  );
}
