import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFollowing } from "@/lib/supabase/queries";
import { FollowButton } from "@/components/follow-button";

export const dynamic = "force-dynamic";

export default async function MyFollowingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const authors = await getMyFollowing(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">我的關注</h1>
          <p className="mt-1 text-sm text-slate-500">
            你關注的作者，共 {authors.length} 位
          </p>
        </div>
        <Link href="/dashboard" className="btn-secondary shrink-0">
          返回個人首頁
        </Link>
      </div>

      {authors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500">還沒有關注任何作者</p>
          <Link href="/works" className="btn-primary mt-4">
            去發現作者
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {authors.map((author) => (
            <div
              key={author.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                {author.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.username ?? "作者頭像"}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
                    {(author.username ?? "作").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {author.username ?? "匿名作者"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    關注於 {author.followed_at.slice(0, 10)} · {" "}
                    {author.works.length > 0
                      ? `${author.works.length} 部作品`
                      : "暫無公開作品"}
                  </p>
                </div>
                <FollowButton
                  authorId={author.id}
                  loggedIn={!!user}
                  initialFollowing={true}
                />
              </div>

              {author.works.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto border-t border-slate-100 pt-3">
                  {author.works.map((w) => (
                    <Link
                      key={w.id}
                      href={`/works/${w.id}`}
                      className="w-16 shrink-0"
                    >
                      {w.cover_url ? (
                        <img
                          src={w.cover_url}
                          alt={w.title}
                          className="h-20 w-16 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-16 items-center justify-center rounded-md bg-slate-100 text-[10px] text-slate-400">
                          無封面
                        </div>
                      )}
                      <p className="mt-1 truncate text-[11px] text-slate-600">
                        {w.title}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
