import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyWorksComments } from "@/lib/supabase/queries";
import { CommentDeleteButton } from "@/components/comment-delete-button";

export const dynamic = "force-dynamic";

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "剛剛";
  if (minutes < 60) return `${minutes} 分鐘前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小時前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return d.toLocaleDateString("zh-CN");
}

export default async function DashboardCommentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const comments = await getMyWorksComments(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">留言管理</h1>
          <p className="mt-1 text-sm text-slate-500">
            讀者在你作品下的留言，可以刪除不當內容
          </p>
        </div>
        <Link href="/dashboard" className="btn-secondary">
          返回我的作品
        </Link>
      </div>

      {comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500">還沒有收到留言</p>
          <p className="mt-1 text-xs text-slate-400">
            讀者在你的作品頁留言後會顯示在這裡
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/works/${c.work_id}`}
                    className="rounded bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
                  >
                    《{c.work?.title ?? "未知作品"}》
                  </Link>
                  <span className="text-sm font-medium text-slate-700">
                    {c.profile?.username ?? "佚名讀者"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatTime(c.created_at)}
                  </span>
                </div>
                <CommentDeleteButton commentId={c.id} />
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {c.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
