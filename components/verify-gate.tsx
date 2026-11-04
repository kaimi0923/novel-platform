"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * 实名认证闸门：包住发布/编辑作品表单。
 * 实名认证未通过（verify_status !== 'approved'）时拦截并提示去认证。
 */
export default function VerifyGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "verified" | "blocked">("loading");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("verify_status")
        .eq("id", user.id)
        .single();
      setState(profile?.verify_status === "approved" ? "verified" : "blocked");
    })();
  }, [router]);

  if (state === "loading") {
    return (
      <p className="px-4 py-20 text-center text-sm text-slate-400">加载中…</p>
    );
  }

  if (state === "blocked") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-10">
          <p className="text-3xl">🔒</p>
          <h1 className="mt-3 text-xl font-bold text-slate-900">
            发布作品前需完成实名认证
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            为了保障作者权益与内容安全，完成实名认证并通过审核后，
            才能发布 / 编辑作品。
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/dashboard/verify" className="btn-primary">
              去实名认证
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              返回我的作品
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
