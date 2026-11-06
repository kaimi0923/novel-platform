"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface FollowButtonProps {
  authorId: string;
  loggedIn: boolean;
  initialFollowing: boolean;
}

/** 关注作者按钮：未登录跳登录，已关注可取消 */
export function FollowButton({
  authorId,
  loggedIn,
  initialFollowing,
}: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!loggedIn) {
      router.push(`/login?redirect=${encodeURIComponent("/")}`);
      return;
    }
    if (loading) return;
    setLoading(true);
    const supabase = createClient();
    try {
      if (following) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("following_id", authorId);
        if (!error) setFollowing(false);
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/login?redirect=${encodeURIComponent("/")}`);
          return;
        }
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: authorId });
        if (!error) setFollowing(true);
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
        following
          ? "inline-flex items-center gap-1.5 rounded-lg border border-brand-600 bg-brand-50 px-4 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100 disabled:opacity-50"
          : "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-600 disabled:opacity-50"
      }
    >
      {following ? "已关注" : "＋ 关注作者"}
    </button>
  );
}
