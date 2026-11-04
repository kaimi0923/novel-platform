"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** 证件照片预览（私有桶，用签名 URL 加载，管理员可见） */
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
        {path ? "加载中…" : "未上传证件照片"}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="证件照片"
      className="h-28 w-44 rounded-lg border border-slate-200 object-cover"
    />
  );
}
