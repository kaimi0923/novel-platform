import Link from "next/link";
import { getApprovedWorks } from "@/lib/supabase/queries";
import { WorkCard } from "@/components/work-card";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function WorksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const works = await getApprovedWorks(category, 60);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">书库</h1>
        <p className="mt-1 text-sm text-stone-500">
          全部已通过审核的原创作品
        </p>
      </div>

      {/* 分类筛选 */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <Link
          href="/works"
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            !category
              ? "bg-brand-600 text-white"
              : "border border-stone-300 bg-white text-stone-600 hover:border-brand-400 hover:text-brand-600"
          }`}
        >
          全部
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/works?category=${encodeURIComponent(c)}`}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              category === c
                ? "bg-brand-600 text-white"
                : "border border-stone-300 bg-white text-stone-600 hover:border-brand-400 hover:text-brand-600"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {works.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="text-stone-500">
            {category ? `「${category}」分类下还没有作品` : "还没有作品上架"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((work, i) => (
            <WorkCard key={work.id} work={work} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
