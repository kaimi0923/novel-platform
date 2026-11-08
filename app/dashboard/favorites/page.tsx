import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFavorites } from "@/lib/supabase/queries";
import { FavoriteCard, type FavoriteCardData } from "@/components/favorite-card";

export const dynamic = "force-dynamic";

export default async function MyFavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const favorites = await getMyFavorites(user.id);

  const cards: FavoriteCardData[] = favorites.map((w) => ({
    id: w.id,
    title: w.title,
    cover_url: w.cover_url ?? null,
    category: w.category,
    type: w.type ?? "novel",
    status: w.status,
    view_count: w.view_count ?? 0,
    favorite_count: w.favorite_count ?? 0,
    favorited_at: w.favorited_at,
    author_username: w.author?.username ?? null,
    author_avatar: w.author?.avatar_url ?? null,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">我的收藏</h1>
          <p className="mt-1 text-sm text-slate-500">
            你收藏的作品與作者，共 {cards.length} 部
          </p>
        </div>
        <Link href="/dashboard" className="btn-secondary shrink-0">
          返回個人首頁
        </Link>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500">還沒有收藏任何作品</p>
          <Link href="/works" className="btn-primary mt-4">
            去書庫逛逛
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((work) => (
            <FavoriteCard key={work.id} work={work} />
          ))}
        </div>
      )}
    </div>
  );
}
