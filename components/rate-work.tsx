"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface RateWorkProps {
  workId: string;
  loggedIn: boolean;
  initialScore: number | null;
}

/** 作品评分：5 星打分（可修改），一次只能打一次分 */
export function RateWork({ workId, loggedIn, initialScore }: RateWorkProps) {
  const router = useRouter();
  const [score, setScore] = useState<number | null>(initialScore);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  async function rate(n: number) {
    if (!loggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(`/works/${workId}`)}`);
      return;
    }
    if (loading) return;
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.push(`/login?redirect=${encodeURIComponent(`/works/${workId}`)}`);
      return;
    }
    const { error } = await supabase.from("work_ratings").upsert(
      {
        work_id: workId,
        user_id: user.id,
        score: n,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "work_id,user_id" }
    );
    setLoading(false);
    if (!error) {
      setScore(n);
      router.refresh();
    }
  }

  const active = hover || score || 0;

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
      <span className="text-xs text-slate-500">
        {score ? "我的评分" : "打个分"}
      </span>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={loading}
            onClick={() => rate(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className={`px-0.5 text-base leading-none transition disabled:opacity-60 ${
              n <= active ? "text-amber-500" : "text-slate-300 hover:text-amber-400"
            }`}
            aria-label={`${n} 星`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}
