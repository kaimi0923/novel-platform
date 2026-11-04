import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyWorksComments } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const comments = await getMyWorksComments(user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">通知</h1>
      <p className="mt-1 text-sm text-slate-500">
        读者在你作品下的最新留言
      </p>

      <div className="mt-6">
        {comments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">暂无通知</p>
            <p className="mt-1 text-xs text-slate-400">
              读者在你的作品下留言后，会在这里看到
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    <span className="font-medium text-slate-900">
                      {c.profile?.username ?? "读者"}
                    </span>{" "}
                    评论了你的作品
                    {c.work?.title ? (
                      <>
                        {" "}
                        《
                        <Link
                          href={`/works/${c.work_id}`}
                          className="font-medium text-brand-600 hover:underline"
                        >
                          {c.work.title}
                        </Link>
                        》
                      </>
                    ) : null}
                  </p>
                  <span className="shrink-0 text-xs text-slate-400">
                    {new Date(c.created_at).toLocaleString("zh-CN", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {c.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
