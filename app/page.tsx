import Link from "next/link";
import { getApprovedWorks } from "@/lib/supabase/queries";
import { WorkCard } from "@/components/work-card";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const latestWorks = await getApprovedWorks(undefined, 12);

  return (
    <div>
      {/* Hero 区 */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            拾笔小说
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            一个开放的原创小说投稿与阅读平台
            <br />
            你的故事，值得被更多人看见
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/dashboard/works/new" className="btn-primary !px-6 !py-3 !text-base">
              开始投稿
            </Link>
            <Link href="/works" className="btn-secondary !px-6 !py-3 !text-base">
              浏览书库
            </Link>
          </div>
        </div>
      </section>

      {/* 分类导航 */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/works?category=${encodeURIComponent(c)}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 transition hover:border-brand-400 hover:text-brand-600"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* 最新作品 */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">最新上架</h2>
          <Link href="/works" className="text-sm text-brand-600 transition hover:text-brand-700">
            查看全部 →
          </Link>
        </div>

        {latestWorks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">还没有作品上架，来发布第一本吧</p>
            <Link href="/dashboard/works/new" className="btn-primary mt-4">
              立即投稿
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestWorks.map((work, i) => (
              <WorkCard key={work.id} work={work} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
