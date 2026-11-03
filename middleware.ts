import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * 全局中间件：负责刷新登录会话 + 保护需要登录的页面
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 匹配所有需要登录的路由（排除静态资源和图片）
     * dashboard = 作者中心，admin = 审核后台
     */
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
