import { createBrowserClient } from "@supabase/ssr";

/**
 * 瀏覽器端 Supabase 客戶端（用於"客戶端元件"裡的登入/註冊/提交表單等操作）
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
