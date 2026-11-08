import Link from "next/link";
import { Work } from "@/lib/types";

const COVER_FALLBACK_COLORS = [
  "from-brand-400 to-brand-600",
  "from-sky-400 to-brand-500",
  "from-brand-500 to-indigo-500",
  "from-cyan-400 to-brand-500",
  "from-indigo-400 to-brand-600",
  "from-brand-400 to-blue-700",
];

function formatCount(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}萬`;
  return `${n}`;
}

/** 字數 / 圖片數的友好展示 */
function formatLength(work: Work) {
  if (work.type === "art" || work.type === "comic") {
    return `${work.chapter_count ?? 0} 張圖`;
  }
  const n = work.word_count ?? 0;
  if (n === 0) return "0 字";
  if (n >= 10000) return `${(n / 10000).toFixed(1)} 萬字`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)} 千字`;
  return `${n} 字`;
}

/** 人氣榜豎版大卡片：封面大圖 + 標題 + 作者/閱讀 + 簡介 + 標籤 */
export function PopularCard({ work, index = 0 }: { work: Work; index?: number }) {
  const gradient =
    COVER_FALLBACK_COLORS[index % COVER_FALLBACK_COLORS.length];

  return (
    <Link
      href={`/works/${work.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
    >
      {/* 封面 */}
      <div
        className={`relative flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-br ${gradient} px-3 text-center`}
      >
        {work.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={work.cover_url}
            alt={work.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="line-clamp-5 text-base font-bold leading-snug text-white drop-shadow">
            {work.title}
          </span>
        )}
        {/* 閱讀量角標 */}
        <span className="absolute bottom-2 right-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
          {formatCount(work.view_count)} 閱讀
        </span>
        {/* 連載狀態角標 */}
        <span
          className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur ${
            work.is_completed ? "bg-emerald-600/85" : "bg-brand-600/85"
          }`}
        >
          {work.is_completed ? "已完結" : "連載中"}
        </span>
        {/* 評分角標 */}
        {(work.rating_count ?? 0) > 0 && (
          <span className="absolute bottom-2 left-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-amber-300 backdrop-blur">
            ★ {(work.rating_average ?? 0).toFixed(1)}
          </span>
        )}
      </div>

      {/* 資訊 */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-brand-600">
          {work.title}
        </h3>
        <p className="mt-0.5 text-xs text-slate-400">
          作者：{work.author?.username ?? "佚名"}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-400">
          {(work.rating_count ?? 0) > 0 ? (
            <span className="font-medium text-amber-600">
              ★ {(work.rating_average ?? 0).toFixed(1)}
              <span className="ml-0.5 font-normal text-slate-400">
                ({work.rating_count})
              </span>
            </span>
          ) : (
            <span>暫無評分</span>
          )}
          <span className="text-slate-300">|</span>
          <span>{formatLength(work)}</span>
          <span className="text-slate-300">|</span>
          <span>{work.favorite_count ?? 0} 收藏</span>
        </p>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {work.description ?? "（暫無簡介）"}
        </p>
        {work.tags && work.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {work.tags.slice(0, 3).map((tag) => (
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
    </Link>
  );
}
