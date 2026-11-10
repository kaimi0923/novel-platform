import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * LINE 登入第一步：把使用者帶去 LINE 授權頁。
 *
 * 這裡不走 Supabase 的 custom provider（它在回呼階段拿不到 provider id），
 * 而是由站內自己完成 OAuth，回呼在 /api/auth/line/callback。
 */

const CHANNEL_ID = process.env.LINE_CHANNEL_ID ?? "2012533643";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/dashboard";

  // 防止 CSRF：自己發一組 state，存進 cookie 等回呼時比對
  const state = crypto.randomUUID().replace(/-/g, "");
  const cookieStore = await cookies();
  cookieStore.set("line_oauth_state", `${state}|${next}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  });

  const authorize = new URL("https://access.line.me/oauth2/v2.1/authorize");
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", CHANNEL_ID);
  authorize.searchParams.set("redirect_uri", `${url.origin}/api/auth/line/callback`);
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("scope", "profile");

  return NextResponse.redirect(authorize.toString());
}
