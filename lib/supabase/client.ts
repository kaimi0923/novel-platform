import { createBrowserClient } from "@supabase/ssr";

/**
 * 浏览器端 Supabase 客户端（用于"客户端组件"里的登录/注册/提交表单等操作）
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
