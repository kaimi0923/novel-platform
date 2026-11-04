import Link from "next/link";
import { Work } from "@/lib/types";

/** 插画/漫画画廊网格：封面大图为主，3:4 比例卡片 */
export function GalleryGrid({ works }: { works: Work[] }) {
  if (works.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-slate-500">这个板块还没有作品，快去创作上传吧！</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {works.map((work) => (
        <Link
          key={work.id}
          href={`/works/${work.id}`}
          className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
            {work.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={work.cover_url}
                alt={work.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-400 to-indigo-600 p-4 text-center">
                <span className="line-clamp-3 text-sm font-bold text-white drop-shadow">
                  {work.title}
                </span>
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-brand-600">
              {work.title}
            </h3>
            <p className="mt-0.5 truncate text-xs text-slate-400">
              {work.author?.username ?? "佚名"} · {work.view_count} 浏览
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
