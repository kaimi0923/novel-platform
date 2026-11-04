import { getApprovedWorks } from "@/lib/supabase/queries";
import { GalleryGrid } from "@/components/gallery-grid";

export const dynamic = "force-dynamic";

export default async function ArtPage() {
  const works = await getApprovedWorks(undefined, 60, "latest", undefined, "art");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">插画</h1>
        <p className="mt-1 text-sm text-slate-500">
          创作者们分享的原创插画作品
        </p>
      </div>
      <GalleryGrid works={works} />
    </div>
  );
}
