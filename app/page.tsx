import Link from "next/link";
import { getApprovedWorks } from "@/lib/supabase/queries";
import { WorkCard } from "@/components/work-card";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

// 每个分类的配色与图标
const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  都市: { bg: "bg-blue-50", text: "text-blue-700", icon: "🏙️" },
  言情: { bg: "bg-pink-50", text: "text-pink-700", icon: "💕" },
  玄幻: { bg: "bg-violet-50", text: "text-violet-700", icon: "✨" },
  仙侠: { bg: "bg-sky-50", text: "text-sky-700", icon: "⛰️" },
  悬疑: { bg: "bg-indigo-50", text: "text-indigo-700", icon: "🔍" },
  科幻: { bg: "bg-cyan-50", text: "text-cyan-700", icon: "🚀" },
  历史: { bg: "bg-amber-50", text: "text-amber-700", icon: "🏯" },
  校园: { bg: "bg-green-50", text: "text-green-700", icon: "🏫" },
  游戏: { bg: "bg-orange-50", text: "text-orange-700", icon: "🎮" },
  短篇: { bg: "bg-yellow-50", text: "text-yellow-700", icon: "📝" },
  其他: { bg: "bg-slate-100", text: "text-slate-600", icon: "📚" },
};

export default async function HomePage() {
  const latestWorks = await getApprovedWorks(undefined, 12);

  return (
    <div>
      {/* 横幅 Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-brand-700">
        {/* 装饰光斑 */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="absolute -right-10 top-8 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" />
        </div>
        {/* 星星点缀 */}
        <div className="pointer-events-none absolute inset-0 opacity-70">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/80"
              style={{
                left: `${(i * 61 + 7) % 100}%`,
                top: `${(i * 37 + 13) % 100}%`,
                opacity: 0.3 + ((i * 13) % 5) * 0.12,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur">
            🔥 鬼点子创作季 · 火热征稿中
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            鬼点子
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            一个开放的原创小说投稿与阅读平台
            <br />
            你的故事，值得被更多人看见
          </p>
          <div className="mt-9 flex items-center justify-center gap-4">
            <Link
              href="/dashboard/works/new"
              className="rounded-lg bg-white px-7 py-3 text-base font-semibold text-slate-900 shadow-lg transition hover:bg-brand-50 active:scale-[0.98]"
            >
              开始投稿
            </Link>
            <Link
              href="/works"
              className="rounded-lg border border-white/40 bg-white/10 px-7 py-3 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.98]"
            >
              浏览书库
            </Link>
          </div>
        </div>
      </section>

      {/* 分类导航（彩色卡片） */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-5 text-xl font-semibold text-slate-900">作品分类</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => {
            const s = CATEGORY_STYLES[c] ?? CATEGORY_STYLES["其他"];
            return (
              <Link
                key={c}
                href={`/works?category=${encodeURIComponent(c)}`}
                className={`flex items-center gap-3 rounded-xl ${s.bg} px-4 py-4 transition hover:opacity-80 hover:shadow-md active:scale-[0.98]`}
              >
                <span className="text-2xl">{s.icon}</span>
                <span className={`text-sm font-semibold ${s.text}`}>{c}</span>
              </Link>
            );
          })}
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
