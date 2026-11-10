import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

/**
 * LINE 登入第二步：LINE 回跳帶 ?code & ?state。
 * 這裡拿 code 換 access token → 拉使用者資料 → 在 Supabase 建/登入對應帳號。
 *
 * 為什麼這樣做：Supabase 的自訂供應商在回呼階段需要 flow_state 裡的 provider_id，
 * 這個欄位在目前專案不存在，會回 error missing provider id。
 * 改成站內自建 OAuth 後，完全不依賴那段邏輯。
 */

const CHANNEL_ID = process.env.LINE_CHANNEL_ID ?? "2012533643";
const CHANNEL_SECRET =
  process.env.LINE_CHANNEL_SECRET ?? "0507fed6f36fe24082621697ac1b71b2";
const PASSWORD_SALT =
  process.env.LINE_LOGIN_SALT ?? "mywhimsy-line-login-salt-2026";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  const cookieStore = await cookies();
  const saved = cookieStore.get("line_oauth_state")?.value;
  cookieStore.delete("line_oauth_state");

  const fail = (reason: string) =>
    NextResponse.redirect(`${url.origin}/login?error=line_${reason}`);

  if (errorParam) return fail("denied");
  if (!code || !state || !saved) return fail("state");

  const [savedState, savedNext] = saved.split("|");
  if (state !== savedState) return fail("state");

  const next = savedNext && savedNext.startsWith("/") ? savedNext : "/dashboard";
  const redirectUri = `${url.origin}/api/auth/line/callback`;

  // 1. code → access token
  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: CHANNEL_ID,
      client_secret: CHANNEL_SECRET,
    }).toString(),
    cache: "no-store",
  });

  if (!tokenRes.ok) return fail("token");
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) return fail("token");

  // 2. access token → 使用者資料（scope 只有 profile）
  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store",
  });

  if (!profileRes.ok) return fail("profile");
  const lineUser = (await profileRes.json()) as {
    userId?: string;
    displayName?: string;
    pictureUrl?: string;
  };

  if (!lineUser.userId) return fail("profile");

  // 3. 用固定的「內部帳號」代表這個 LINE 使用者：
  //    email 固定由 userId 推導，密碼由站內 salt 做 HMAC，只有伺服器算得出來。
  const email = `line_${lineUser.userId.toLowerCase()}@line.mywhimsy.work`;
  const password = createHmac("sha256", PASSWORD_SALT)
    .update(`line:${lineUser.userId}`)
    .digest("hex")
    .slice(0, 32);
  const fallbackName = `line_${lineUser.userId.slice(-8).toLowerCase()}`;

  const supabase = await createClient();

  let signedIn = await supabase.auth.signInWithPassword({ email, password });

  if (signedIn.error) {
    const signedUp = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: fallbackName,
          name: lineUser.displayName ?? "",
          avatar_url: lineUser.pictureUrl ?? "",
          provider: "line",
          line_user_id: lineUser.userId,
        },
      },
    });

    if (signedUp.error) {
      // 帳號已存在但密碼不符（例如 salt 換過），退回註冊入口
      return fail("signup");
    }
  }

  // 4. 補暱稱 / 頭像（衝突時忽略，不影響登入）
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const patch: Record<string, string> = {};

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      const wanted = (lineUser.displayName ?? "").trim().slice(0, 24);

      // 系統自動給的 line_xxxx 暱稱，換成 LINE 上的顯示名稱
      if (profile && wanted && (!profile.username || profile.username.startsWith("line_"))) {
        patch.username = wanted;
      }
      if (profile && !profile.avatar_url && lineUser.pictureUrl) {
        patch.avatar_url = lineUser.pictureUrl;
      }

      if (Object.keys(patch).length > 0) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update(patch)
          .eq("id", user.id);

        // 顯示名稱被別人用走時，補上尾碼再試一次
        if (updateError && patch.username) {
          const suffix = lineUser.userId.slice(-4).toLowerCase();
          patch.username = `${wanted.slice(0, 18)}_${suffix}`;
          await supabase.from("profiles").update(patch).eq("id", user.id);
        }
      }
    }
  } catch {
    // 補資料失敗不影響登入
  }

  return NextResponse.redirect(`${url.origin}${next}`);
}
