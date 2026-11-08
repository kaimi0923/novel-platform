import { getApprovedWorks } from "@/lib/supabase/queries";
import { GalleryGrid } from "@/components/gallery-grid";

export const dynamic = "force-dynamic";

export default async function ComicPage() {
  const works = await getApprovedWorks(undefined, 60, "latest", undefined, "comic");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">漫畫</h1>
        <p className="mt-1 text-sm text-slate-500">
          原創漫畫連載與短篇作品
        </p>
      </div>
      <GalleryGrid works={works} />
    </div>
  );
}
