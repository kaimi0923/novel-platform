"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CommentDeleteButton({ commentId }: { commentId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (deleting) return;
    if (!window.confirm("确定删除这条留言吗？")) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    setDeleting(false);
    if (!error) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500 transition hover:border-rose-300 hover:text-rose-600 disabled:opacity-50"
    >
      删除
    </button>
  );
}
