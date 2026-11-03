import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "拾笔小说 · 原创小说投稿与阅读平台",
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
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col">
        <Nav user={user} role={role} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
