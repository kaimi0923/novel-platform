import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 第三方登入（Google / Facebook / Apple / LINE）回跳處理：
 * Supabase 回跳時帶 ?code=xxx，這裡換成 session cookie，再轉回站內頁面。
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${url.origin}/login?error=oauth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${url.origin}/login?error=oauth`);
  }

  // 第三方帳號沒有填過筆名時，用平台暱稱或信箱前綴補一個，之後可在個人設定改
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
      const candidates = [meta.name, meta.full_name, meta.user_name, meta.preferred_username];
      const nickname = (candidates.find((v) => typeof v === "string" && v.trim()) as string | undefined)
        ?? (user.email ? user.email.split("@")[0] : "");

      if (nickname) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .maybeSingle();

        if (profile && !profile.username) {
          await supabase
            .from("profiles")
            .update({ username: nickname.trim().slice(0, 24) })
            .eq("id", user.id);
        }
      }
    }
  } catch {
    // 補筆名失敗不影響登入流程
  }

  return NextResponse.redirect(`${url.origin}${next.startsWith("/") ? next : "/dashboard"}`);
}
