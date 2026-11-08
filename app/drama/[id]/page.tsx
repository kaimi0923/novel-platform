import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DramaPlayer } from "@/components/drama-player";
import type { Work, Episode } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DramaWatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: work } = await supabase
    .from("works")
    .select("*")
    .eq("id", id)
    .single();

  if (!work) notFound();
  const w = work as Work;

  if (w.status !== "approved") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let allowed = !!user && user.id === w.author_id;
    if (!allowed && user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      allowed = profile?.role === "admin";
    }
    if (!allowed) notFound();
  }

  const { data: episodes } = await supabase
    .from("episodes")
    .select("*")
    .eq("work_id", id)
    .order("episode_order", { ascending: true });

  return (
    <div className="fixed inset-0 z-[70] bg-black">
      <DramaPlayer work={w} episodes={(episodes ?? []) as Episode[]} />
    </div>
  );
}
