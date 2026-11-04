"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Comment } from "@/lib/types";

interface CommentSectionProps {
  workId: string;
  initialComments: Comment[];
  loggedIn: boolean;
  canManage: boolean;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return d.toLocaleDateString("zh-CN");
}

export function CommentSection({
  workId,
  initialComments,
  loggedIn,
  canManage,
}: CommentSectionProps) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const text = content.trim();
    if (!text) {
      setError("留言内容不能为空");
      return;
    }
    if (text.length > 500) {
      setError("留言最多 500 字");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/works/${workId}`)}`);
      setSubmitting(false);
      return;
    }
    const { data, error: err } = await supabase
      .from("comments")
      .insert({ work_id: workId, content: text })
      .select("*, profile:profiles!comments_user_id_fkey(username)")
      .single();
    setSubmitting(false);
    if (err) {
      setError("留言失败，请稍后再试");
      return;
    }
    setComments((prev) => [data as Comment, ...prev]);
    setContent("");
  }

  async function handleDelete(commentId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        留言（{comments.length}）
      </h2>

      {/* 留言框 */}
      {loggedIn ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的读后感或想对作者说的话…"
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">{content.length}/500</span>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary !px-4 !py-2 !text-xs"
            >
              发布留言
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          <Link href={`/login?redirect=${encodeURIComponent(`/works/${workId}`)}`} className="font-medium text-brand-600 hover:underline">
            登录
          </Link>
          后即可留言
        </p>
      )}

      {/* 留言列表 */}
      <div className="mt-4 space-y-3">
        {comments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            还没有留言，来抢沙发吧！
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700">
                    {(c.profile?.username ?? "读")[0]}
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    {c.profile?.username ?? "佚名读者"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatTime(c.created_at)}
                  </span>
                </div>
                {canManage && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-xs text-slate-400 transition hover:text-rose-600"
                  >
                    删除
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
