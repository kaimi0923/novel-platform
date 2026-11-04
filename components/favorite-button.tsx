"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface FavoriteButtonProps {
  workId: string;
  initialCount: number;
  initialFavorited: boolean;
  loggedIn: boolean;
}

export function FavoriteButton({
  workId,
  initialCount,
  initialFavorited,
  loggedIn,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!loggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(`/works/${workId}`)}`);
      return;
    }
    if (loading) return;
    setLoading(true);
    const supabase = createClient();
    try {
      if (favorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("work_id", workId);
        if (!error) {
          setFavorited(false);
          setCount((c) => Math.max(0, c - 1));
        }
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ work_id: workId });
        if (!error) {
          setFavorited(true);
          setCount((c) => c + 1);
        }
      }
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={
        favorited
          ? "inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand-600 bg-brand-50 px-6 py-3 text-sm font-medium text-brand-700 transition hover:bg-brand-100 active:scale-[0.98] disabled:opacity-50"
          : "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-brand-400 hover:text-brand-600 active:scale-[0.98] disabled:opacity-50"
      }
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
      {favorited ? "已收藏" : "收藏"}
      <span className="text-xs opacity-70">{count}</span>
    </button>
  );
}
