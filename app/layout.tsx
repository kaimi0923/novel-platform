import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { BottomNav } from "@/components/bottom-nav";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("meta.title"),
    description: t("meta.desc"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { lang } = await getT();
  const htmlLang =
    lang === "zh-TW"
      ? "zh-Hant-TW"
      : lang === "zh-CN"
        ? "zh-Hans-CN"
        : lang;

  // 容錯：即使獲取登入狀態失敗，網站也應正常展示（按未登入處理）
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;
  try {
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    user = u;
  } catch {
    user = null;
  }

  let role: string | null = null;
  let username: string | null = null;
  let avatarUrl: string | null = null;
  let followerCount = 0;
  let followingCount = 0;

  if (user) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, username, avatar_url")
        .eq("id", user.id)
        .single();
      role = profile?.role ?? null;
      username = profile?.username ?? null;
      avatarUrl = profile?.avatar_url ?? null;

      const [{ count: followers }, { count: following }] = await Promise.all([
        supabase
          .from("follows")
          .select("id", { count: "exact", head: true })
          .eq("following_id", user.id),
        supabase
          .from("follows")
          .select("id", { count: "exact", head: true })
          .eq("follower_id", user.id),
      ]);
      followerCount = followers ?? 0;
      followingCount = following ?? 0;
    } catch {
      // 檔案/關注資料獲取失敗時不影響頁面渲染
    }
  }

  return (
    <html lang={htmlLang}>
      <body className="flex min-h-screen flex-col">
        <I18nProvider lang={lang}>
          <Nav
            user={user}
            role={role}
            username={username}
            avatarUrl={avatarUrl}
            followerCount={followerCount}
            followingCount={followingCount}
          />
          <main className="flex-1 pb-16">{children}</main>
          <Footer />
          <BottomNav />
        </I18nProvider>
      </body>
    </html>
  );
}
