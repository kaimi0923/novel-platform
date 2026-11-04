import Link from "next/link";
import { getApprovedWorks } from "@/lib/supabase/queries";
import { WorkCard } from "@/components/work-card";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function WorksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const { category, tag } = await searchParams;
  const works = await getApprovedWorks(category, 60, "latest", tag);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">书库</h1>
        <p className="mt-1 text-sm text-slate-500">
          全部已通过审核的原创作品
        </p>
      </div>

      {/* 分类筛选 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href={tag ? `/works?tag=${encodeURIComponent(tag)}` : "/works"}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            !category
              ? "bg-brand-600 text-white"
              : "border border-slate-300 bg-white text-slate-600 hover:border-brand-400 hover:text-brand-600"
          }`}
        >
          全部
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/works?category=${encodeURIComponent(c)}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              category === c
                ? "bg-brand-600 text-white"
                : "border border-slate-300 bg-white text-slate-600 hover:border-brand-400 hover:text-brand-600"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {/* 当前标签筛选 */}
      {tag && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="text-slate-400">正在筛选标签：</span>
          <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700">
            #{tag}
          </span>
          <Link
            href={category ? `/works?category=${encodeURIComponent(category)}` : "/works"}
            className="text-xs text-slate-400 underline transition hover:text-brand-600"
          >
            清除标签筛选
          </Link>
        </div>
      )}

      {works.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500">
            {tag
              ? `没有带「${tag}」标签的作品`
              : category
                ? `「${category}」分类下还没有作品`
                : "还没有作品上架"}
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
