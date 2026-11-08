import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { BottomNav } from "@/components/bottom-nav";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "鬼点子 · 原创小说投稿与阅读平台",
  description: "一个开放的原创小说投稿与阅读平台：作者自由投稿，读者在线阅读。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  // 容错：即使获取登录状态失败，网站也应正常展示（按未登录处理）
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
      // 档案/关注数据获取失败时不影响页面渲染
    }
  }

  return (
    <html lang="zh-CN">
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
