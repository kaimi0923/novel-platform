import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { BottomNav } from "@/components/bottom-nav";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "鬼點子 · 原創小說投稿與閱讀平臺",
  description: "一個開放的原創小說投稿與閱讀平臺：作者自由投稿，讀者線上閱讀。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

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
    <html lang="zh-Hant-TW">
      <body className="flex min-h-screen flex-col">
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
      </body>
    </html>
  );
}
