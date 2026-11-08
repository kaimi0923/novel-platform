"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Work, Episode } from "@/lib/types";

export function DramaPlayer({
  work,
  episodes,
}: {
  work: Work;
  episodes: Episode[];
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [showList, setShowList] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [toast, setToast] = useState("");
  const [ended, setEnded] = useState(false);

  const storageKey = `drama_progress_${work.id}`;

  // 初始：URL ?ep=N 優先，其次恢復上次看到第幾集
  useEffect(() => {
    const epParam = Number(
      new URLSearchParams(window.location.search).get("ep") ?? "0"
    );
    const saved = Number(localStorage.getItem(storageKey) ?? "0");
    let target = 0;
    if (epParam > 0 && epParam <= episodes.length) target = epParam - 1;
    else if (saved > 0 && saved < episodes.length) target = saved;

    if (target > 0) {
      setIndex(target);
      requestAnimationFrame(() => {
        const el = document.querySelectorAll<HTMLElement>("[data-ep]")[target];
        el?.scrollIntoView({ block: "start" });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 登入狀態 + 是否已追劇
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) return;
      const { data: fav } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", uid)
        .eq("work_id", work.id)
        .maybeSingle();
      setFavorited(!!fav);
    });
  }, [work.id]);



  // 監聽哪一集在螢幕中
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-ep]")
    );
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
            const order = Number((entry.target as HTMLElement).dataset.ep ?? 0);
            setIndex(order);
            localStorage.setItem(storageKey, String(order));
          }
        }
      },
      { threshold: [0.55, 0.9] }
    );
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [storageKey]);

  // 切換集：播放當前，暫停其他
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) {
        setProgress(0);
        v.play().catch(() => {
          /* 瀏覽器限制自動播放時等使用者點 */
        });
      } else {
        v.pause();
      }
    });
  }, [index]);

  const goTo = useCallback((i: number) => {
    const el = document.querySelectorAll<HTMLElement>("[data-ep]")[i];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setShowList(false);
  }, []);

  async function toggleFavorite() {
    if (!userId) {
      router.push(`/login?redirect=${encodeURIComponent(`/drama/${work.id}`)}`);
      return;
    }
    const supabase = createClient();
    if (favorited) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("work_id", work.id);
      setFavorited(false);
      flash("已取消追劇");
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, work_id: work.id });
      if (error) {
        flash("追劇失敗：" + error.message);
        return;
      }
      setFavorited(true);
      flash("已加入我的追劇");
    }
  }

  async function share() {
    const url = `${window.location.origin}/drama/${work.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: work.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        flash("連結已複製");
      }
    } catch {
      /* 使用者取消 */
    }
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  const ep = episodes[index];

  return (
    <div className="relative h-[100dvh] w-full bg-black">
      {/* 頂部資訊 */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 bg-gradient-to-b from-black/60 to-transparent px-3 pb-8 pt-3">
        <div className="pointer-events-auto flex items-center gap-2">
          <Link
            href="/drama"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
            aria-label="返回"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {work.title}
            </p>
            <p className="text-[11px] text-white/60">
              全 {episodes.length} 集{ep ? ` · 第 ${ep.episode_order} 集` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* 劇集流 */}
      <div
        ref={containerRef}
        className="h-[100dvh] snap-y snap-mandatory overflow-y-scroll overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {episodes.map((item, i) => (
          <section
            key={item.id}
            data-ep={i}
            className="relative flex h-[100dvh] w-full snap-start snap-always items-center justify-center"
          >
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={item.video_url}
              poster={item.cover_url ?? undefined}
              playsInline
              preload={Math.abs(i - index) <= 1 ? "metadata" : "none"}
              controls={false}
              className="h-full w-full object-contain"
              onTimeUpdate={(e) => {
                if (i !== index) return;
                const v = e.currentTarget;
                if (v.duration) setProgress((v.currentTime / v.duration) * 100);
              }}
              onEnded={() => {
                if (i < episodes.length - 1) goTo(i + 1);
                else setEnded(true);
              }}
              onClick={(e) => {
                const v = e.currentTarget;
                if (v.paused) v.play().catch(() => {});
                else v.pause();
              }}
            />

            {/* 播放按鈕（暫停時） */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-black/40 p-4 text-white opacity-0" />
            </div>

            {/* 右側操作 */}
            <div className="absolute bottom-28 right-2 z-20 flex flex-col items-center gap-4">
              <button
                onClick={() => setShowList(true)}
                className="flex flex-col items-center text-white"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="4" y="4" width="7" height="7" rx="1.5" />
                    <rect x="13" y="4" width="7" height="7" rx="1.5" />
                    <rect x="4" y="13" width="7" height="7" rx="1.5" />
                    <rect x="13" y="13" width="7" height="7" rx="1.5" />
                  </svg>
                </span>
                <span className="mt-1 text-[11px] text-white/80">選集</span>
              </button>

              <button
                onClick={toggleFavorite}
                className="flex flex-col items-center text-white"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                  <svg viewBox="0 0 24 24" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className={`h-5 w-5 ${favorited ? "text-amber-400" : ""}`}>
                    <path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18.6 7.2 20.9l1.1-6.5L3.6 9.8l6.5-.9L12 3z" />
                  </svg>
                </span>
                <span className="mt-1 text-[11px] text-white/80">
                  {favorited ? "已追" : "追劇"}
                </span>
              </button>

              <button onClick={share} className="flex flex-col items-center text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" />
                    <path d="M12 3v13M8 7l4-4 4 4" />
                  </svg>
                </span>
                <span className="mt-1 text-[11px] text-white/80">分享</span>
              </button>
            </div>

            {/* 底部：劇名/簡介 */}
            <div className="pointer-events-none absolute bottom-4 left-0 right-16 z-20 px-4 pb-2">
              <p className="text-sm font-semibold text-white">{work.title}</p>
              {item.title && (
                <p className="mt-0.5 text-xs text-white/70">{item.title}</p>
              )}
            </div>

            {/* 進度條 */}
            {i === index && (
              <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/20">
                <div
                  className="h-full bg-brand-500 transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </section>
        ))}
        {episodes.length === 0 && (
          <div className="flex h-[100dvh] flex-col items-center justify-center gap-2 text-white/70">
            <p>這部劇還沒有上傳劇集</p>
            <Link href="/drama" className="mt-2 text-sm text-brand-400">
              返回短劇
            </Link>
          </div>
        )}
      </div>

      {toast && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 rounded-lg bg-black/80 px-4 py-2 text-sm text-white">
          {toast}
        </div>
      )}

      {ended && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-black/85 px-6 text-center text-white">
          <p className="text-lg font-semibold">已看完最後一集</p>
          <p className="text-sm text-white/60">想看更多？去短劇頻道逛逛</p>
          <Link href="/drama" className="btn-primary mt-1">
            發現更多短劇
          </Link>
          <button onClick={() => setEnded(false)} className="text-xs text-white/50">
            繼續停留
          </button>
        </div>
      )}

      {/* 選集抽屜 */}
      {showList && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/50">
          <div className="max-h-[60vh] overflow-y-auto rounded-t-2xl bg-white pb-6">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">
                選集（共 {episodes.length} 集）
              </p>
              <button onClick={() => setShowList(false)} className="text-xs text-slate-500">
                關閉
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2 p-4">
              {episodes.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => goTo(i)}
                  className={`rounded-lg py-2.5 text-sm ${
                    i === index
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.episode_order}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
