import Link from "next/link";
import { getApprovedWorks } from "@/lib/supabase/queries";
import { WorkCard } from "@/components/work-card";
import { PopularCard } from "@/components/popular-card";
import { CATEGORIES } from "@/lib/constants";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

// 每個分類的卡片配色、圖示與文字色（3D 圖示存於 public/cat-icons）
const CATEGORY_STYLES: Record<string, { grad: string; text: string; icon: string }> = {
  都市: { grad: "from-sky-100 via-blue-50 to-white", text: "text-[#1e4d91]", icon: "/cat-icons/urban.png" },
  言情: { grad: "from-pink-100 via-rose-50 to-white", text: "text-[#c2255c]", icon: "/cat-icons/romance.png" },
  玄幻: { grad: "from-violet-100 via-purple-50 to-white", text: "text-[#6741d9]", icon: "/cat-icons/fantasy.png" },
  仙俠: { grad: "from-sky-100 via-cyan-50 to-white", text: "text-[#1971c2]", icon: "/cat-icons/xianxia.png" },
  懸疑: { grad: "from-indigo-100 via-violet-50 to-white", text: "text-[#3b5bdb]", icon: "/cat-icons/mystery.png" },
  科幻: { grad: "from-cyan-100 via-sky-50 to-white", text: "text-[#0c8599]", icon: "/cat-icons/scifi.png" },
  歷史: { grad: "from-amber-100 via-yellow-50 to-white", text: "text-[#996a12]", icon: "/cat-icons/history.png" },
  校園: { grad: "from-emerald-100 via-green-50 to-white", text: "text-[#2b8a3e]", icon: "/cat-icons/campus.png" },
  遊戲: { grad: "from-orange-100 via-amber-50 to-white", text: "text-[#d9480f]", icon: "/cat-icons/game.png" },
  短篇: { grad: "from-yellow-100 via-amber-50 to-white", text: "text-[#a16207]", icon: "/cat-icons/short.png" },
  其他: { grad: "from-slate-100 via-slate-50 to-white", text: "text-[#495057]", icon: "/cat-icons/other.png" },
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

      {/* 分類導航（3D 圖示彩色卡片） */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-slate-900">
          <span className="h-5 w-1.5 rounded-full bg-brand-500" />
          {t("home.categories")}
          <span className="text-base leading-none">✨</span>
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => {
            const s = CATEGORY_STYLES[c] ?? CATEGORY_STYLES["其他"];
            return (
              <Link
                key={c}
                href={`/works?category=${encodeURIComponent(c)}`}
                className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br ${s.grad} px-3.5 py-3.5 shadow-[0_10px_26px_-18px_rgba(15,23,42,0.5)] ring-1 ring-white/70 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-16px_rgba(15,23,42,0.45)] active:scale-[0.98]`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.icon}
                  alt=""
                  className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_3px_6px_rgba(15,23,42,0.15)] sm:h-14 sm:w-14"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-[15px] font-bold leading-tight ${s.text}`}>
                    {t(`cat.${c}`)}
                  </p>
                  <p className="mt-1 truncate text-[11px] leading-tight text-slate-500">
                    {t(`catDesc.${c}`)}
                  </p>
                </div>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/75 text-slate-400 shadow-sm ring-1 ring-white transition group-hover:bg-white group-hover:text-brand-600">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
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
