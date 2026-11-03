import Link from "next/link";
import { Work } from "@/lib/types";

const COVER_FALLBACK_COLORS = [
  "from-orange-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-sky-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-fuchsia-400 to-purple-500",
  "from-cyan-400 to-blue-500",
];

export function WorkCard({ work, index = 0 }: { work: Work; index?: number }) {
  const gradient =
    COVER_FALLBACK_COLORS[index % COVER_FALLBACK_COLORS.length];

  return (
    <Link
      href={`/works/${work.id}`}
      className="group flex gap-4 rounded-xl border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
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
            <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs text-brand-700">
              {work.category}
            </span>
            <span className="text-xs text-stone-400">
              {work.chapter_count ?? 0} 章
            </span>
          </div>
          <h3 className="truncate text-base font-semibold text-stone-900 group-hover:text-brand-600">
            {work.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500">
            {work.description ?? "（暂无简介）"}
          </p>
        </div>
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>作者：{work.author?.username ?? "佚名"}</span>
          <span>{work.view_count} 阅读</span>
        </div>
      </div>
    </Link>
  );
}
