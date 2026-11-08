import Link from "next/link";
import { Work } from "@/lib/types";
import { getT } from "@/lib/i18n/server";

const COVER_FALLBACK_COLORS = [
  "from-brand-400 to-brand-600",
  "from-sky-400 to-brand-500",
  "from-brand-500 to-indigo-500",
  "from-cyan-400 to-brand-500",
  "from-indigo-400 to-brand-600",
  "from-brand-400 to-blue-700",
];

/** 字數/圖片數的友好展示 */
function formatLength(
  work: Work,
  lang: string,
  t: (key: string, vars?: Record<string, string | number>) => string
) {
  if (work.type === "art" || work.type === "comic") {
    return t("card.images", { n: work.chapter_count ?? 0 });
  }
  const n = work.word_count ?? 0;
  if (n === 0) return t("card.zeroWords");
  if (lang === "en") {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k words`;
    return `${n} words`;
  }
  if (n >= 10000) return t("card.wanWords", { n: (n / 10000).toFixed(1) });
  if (n >= 1000) return t("card.qianWords", { n: (n / 1000).toFixed(1) });
  return t("card.words", { n });
}

export async function WorkCard({ work, index = 0 }: { work: Work; index?: number }) {
  const { lang, t } = await getT();
  const gradient =
    COVER_FALLBACK_COLORS[index % COVER_FALLBACK_COLORS.length];

  return (
    <Link
      href={`/works/${work.id}`}
      className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
    >
      <div
        className={`flex h-32 w-24 shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br ${gradient} px-1 text-center`}
      >
        {work.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={work.cover_url}
            alt={work.title}
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <span className="line-clamp-4 text-sm font-bold leading-snug text-white drop-shadow">
            {work.title}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-between py-1">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            {work.type && work.type !== "novel" && (
              <span className="rounded bg-violet-50 px-1.5 py-0.5 text-xs text-violet-700">
                {t(`type.${work.type}`)}
              </span>
            )}
            <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs text-brand-700">
              {t(`cat.${work.category}`)}
            </span>
            <span className="text-xs text-slate-400">
              {t("card.chapterCount", { n: work.chapter_count ?? 0 })}
            </span>
          </div>
          <h3 className="truncate text-base font-semibold text-slate-900 group-hover:text-brand-600">
            {work.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {work.description ?? t("card.noDesc")}
          </p>
          {work.tags && work.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {work.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
          <span className="text-slate-500">
            {t("card.by", { name: work.author?.username ?? t("card.anonymous") })}
          </span>
          <span className="text-slate-300">|</span>
          <span>{t("card.read", { n: work.view_count })}</span>
          <span className="text-slate-300">|</span>
          {(work.rating_count ?? 0) > 0 ? (
            <span className="font-medium text-amber-600">
              ★ {(work.rating_average ?? 0).toFixed(1)}
              <span className="ml-0.5 font-normal text-slate-400">
                ({work.rating_count})
              </span>
            </span>
          ) : (
            <span>{t("card.noRating")}</span>
          )}
          <span className="text-slate-300">|</span>
          <span>{formatLength(work, lang, t)}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400">{t("card.favorites", { n: work.favorite_count ?? 0 })}</span>
          <span
            className={
              work.is_completed
                ? "rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700"
                : "rounded bg-brand-50 px-1.5 py-0.5 font-medium text-brand-700"
            }
          >
            {work.is_completed ? t("card.ended") : t("card.ongoing")}
          </span>
        </div>
      </div>
    </Link>
  );
}
