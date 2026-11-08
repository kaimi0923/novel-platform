import Link from "next/link";
import { getApprovedWorks } from "@/lib/supabase/queries";
import type { Work } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DramaPage() {
  const works = await getApprovedWorks(undefined, 60, "latest", undefined, "drama");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">短劇</h1>
      </div>

      {works.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm text-slate-500">還沒有短劇上線</p>
          <Link
            href="/dashboard/works/new"
            className="btn-primary mt-4 inline-flex"
          >
            投一部短劇
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {works.map((work: Work) => {
            const cover = work.cover_url;
            const epCount = work.episode_count ?? 0;
            return (
              <Link
                key={work.id}
                href={`/drama/${work.id}`}
                className="group relative block aspect-[9/16] overflow-hidden rounded-xl bg-slate-900"
              >
                {cover ? (
                  <img
                    src={cover}
                    alt={work.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 p-4">
                    <span className="text-center text-lg font-bold text-white">
                      {work.title}
                    </span>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 pb-3 pt-10">
                  <p className="line-clamp-2 text-sm font-semibold text-white">
                    {work.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/70">
                    共 {epCount} 集 · {work.category}
                  </p>
                </div>

                <span className="absolute left-2 top-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                  短劇
                </span>
                {work.view_count > 0 && (
                  <span className="absolute right-2 top-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white backdrop-blur">
                    {work.view_count} 在看
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
