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
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return `${n}`;
}

/** 人气榜竖版大卡片：封面大图 + 标题 + 作者/阅读 + 简介 + 标签 */
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
        {/* 阅读量角标 */}
        <span className="absolute bottom-2 right-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
          {formatCount(work.view_count)} 阅读
        </span>
      </div>

      {/* 信息 */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-brand-600">
          {work.title}
        </h3>
        <p className="mt-0.5 text-xs text-slate-400">
          作者：{work.author?.username ?? "佚名"}
        </p>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {work.description ?? "（暂无简介）"}
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
