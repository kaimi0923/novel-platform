import Link from "next/link";
import { getApprovedWorks } from "@/lib/supabase/queries";
import { WorkCard } from "@/components/work-card";
import { PopularCard } from "@/components/popular-card";
import { CATEGORIES } from "@/lib/constants";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

// 每個分類的配色與圖示
const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  都市: { bg: "bg-blue-50", text: "text-blue-700", icon: "🏙️" },
  言情: { bg: "bg-pink-50", text: "text-pink-700", icon: "💕" },
  玄幻: { bg: "bg-violet-50", text: "text-violet-700", icon: "✨" },
  仙俠: { bg: "bg-sky-50", text: "text-sky-700", icon: "⛰️" },
  懸疑: { bg: "bg-indigo-50", text: "text-indigo-700", icon: "🔍" },
  科幻: { bg: "bg-cyan-50", text: "text-cyan-700", icon: "🚀" },
  歷史: { bg: "bg-amber-50", text: "text-amber-700", icon: "🏯" },
  校園: { bg: "bg-green-50", text: "text-green-700", icon: "🏫" },
  遊戲: { bg: "bg-orange-50", text: "text-orange-700", icon: "🎮" },
  短篇: { bg: "bg-yellow-50", text: "text-yellow-700", icon: "📝" },
  其他: { bg: "bg-slate-100", text: "text-slate-600", icon: "📚" },
};

// 首頁熱門標籤（精選，點選進入書庫按標籤篩選）
const HOT_TAGS = [
  "甜寵", "爽文", "輕鬆", "豪門總裁", "贅婿", "女總裁",
  "穿越", "逆襲", "無敵流", "都市", "玄幻", "仙俠",
];

export default async function HomePage() {
  const { t } = await getT();
  const latestWorks = await getApprovedWorks(undefined, 12);
  const popularWorks = await getApprovedWorks(undefined, 6, "popular");
  const dramas = await getApprovedWorks(undefined, 8, "latest", undefined, "drama");

  return (
    <div>
      {/* 首頁頭圖：黃底波普漫畫橫幅（4277×980 比例，全寬顯示） */}
      <section className="bg-[#F4AC0E]">
        <Link href="/works" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-banner.jpg"
            alt="鬼點子 · 漫畫 小說 短視頻 · 各類創作者"
            width={2400}
            height={549}
            className="block h-auto w-full"
          />
        </Link>
      </section>

      {/* 短劇頻道 */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{t("home.drama")}</h2>
          </div>
          <Link
            href="/drama"
            className="text-sm text-brand-600 transition hover:text-brand-700"
          >
            {t("home.allDrama")}
          </Link>
        </div>

        {dramas.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {dramas.map((d) => (
              <Link
                key={d.id}
                href={`/drama/${d.id}`}
                className="group relative block aspect-[9/16] w-[132px] shrink-0 overflow-hidden rounded-xl bg-slate-900 sm:w-[150px]"
              >
                {d.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.cover_url}
                    alt={d.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 p-2">
                    <span className="text-center text-sm font-bold text-white">
                      {d.title}
                    </span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent px-2 pb-2 pt-8">
                  <p className="line-clamp-2 text-xs font-semibold text-white">
                    {d.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/70">
                    {t("home.episodes", { n: d.episode_count ?? 0 })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Link
            href="/drama"
            className="flex items-center justify-between rounded-xl border border-dashed border-brand-300 bg-brand-50/50 px-5 py-6 transition hover:bg-brand-50"
          >
            <div>
              <p className="text-sm font-semibold text-brand-700">
                {t("home.emptyDrama.title")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {t("home.emptyDrama.desc")}
              </p>
            </div>
            <span className="text-sm text-brand-600">{t("home.emptyDrama.link")}</span>
          </Link>
        )}
      </section>

      {/* 分類導航（彩色卡片） */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-5 text-xl font-semibold text-slate-900">{t("home.categories")}</h2>
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
                <span className={`text-sm font-semibold ${s.text}`}>{t(`cat.${c}`)}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 人氣榜（暢銷風格，封面卡片） */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("home.popular")}
          </h2>
          <Link href="/works" className="text-sm text-brand-600 transition hover:text-brand-700">
            {t("home.viewAll")}
          </Link>
        </div>

        {popularWorks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            {t("home.emptyPopular")}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {popularWorks.map((work, i) => (
              <PopularCard key={work.id} work={work} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* 熱門標籤 */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{t("home.hotTags")}</h2>
          <Link href="/works" className="text-sm text-brand-600 transition hover:text-brand-700">
            {t("home.allTags")}
          </Link>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {HOT_TAGS.map((tag) => (
            <Link
              key={tag}
              href={`/works?tag=${encodeURIComponent(tag)}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </section>

      {/* 最新作品 */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{t("home.latest")}</h2>
          <Link href="/works" className="text-sm text-brand-600 transition hover:text-brand-700">
            {t("home.viewAll")}
          </Link>
        </div>

        {latestWorks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">{t("home.emptyLatest")}</p>
            <Link href="/dashboard/works/new" className="btn-primary mt-4">
              {t("home.emptyCta")}
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
