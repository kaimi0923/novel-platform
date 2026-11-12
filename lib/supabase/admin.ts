import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * 伺服器專用 Supabase 客戶端（service_role，繞過 RLS）
 * 只在金流回調等「沒有使用者登入狀態」的場合使用
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "缺少 SUPABASE_SERVICE_ROLE_KEY 環境變數，無法處理金流回調"
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function hasAdminClient(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
