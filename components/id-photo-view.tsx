"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** 證件照片預覽（私有桶，用簽名 URL 載入，管理員可見） */
export default function IdPhotoView({ path }: { path: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const supabase = createClient();
    supabase.storage
      .from("verify-docs")
      .createSignedUrl(path, 600)
      .then(({ data }) => {
        if (data) setSrc(data.signedUrl);
      })
      .catch(() => setSrc(null));
  }, [path]);

  if (!src) {
    return (
      <span className="text-xs text-slate-400">
        {path ? "載入中…" : "未上傳證件照片"}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="證件照片"
      className="h-28 w-44 rounded-lg border border-slate-200 object-cover"
    />
  );
}
