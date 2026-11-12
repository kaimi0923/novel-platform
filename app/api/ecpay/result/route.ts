import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 綠界付款完成後，瀏覽器會被導回這裡（ClientBackURL）
 * 依訂單類型轉回閱讀頁或作品頁，並帶上成功提示
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const tradeNo = url.searchParams.get("no");

  if (!tradeNo) {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  try {
    const admin = createAdminClient();
    const { data: order } = await admin
      .from("orders")
      .select("kind, status, work_id, chapter_id")
      .eq("merchant_trade_no", tradeNo)
      .single();

    if (!order) {
      return NextResponse.redirect(new URL("/?pay=notfound", url.origin));
    }

    if (order.kind === "chapter" && order.work_id && order.chapter_id) {
      const ok = order.status === "paid" ? "1" : "0";
      return NextResponse.redirect(
        new URL(`/read/${order.work_id}/${order.chapter_id}?paid=${ok}`, url.origin)
      );
    }

    if (order.work_id) {
      const ok = order.status === "paid" ? "1" : "0";
      return NextResponse.redirect(
        new URL(`/works/${order.work_id}?tip=${ok}`, url.origin)
      );
    }
  } catch (err) {
    console.error("[ecpay] result 查詢失敗", err);
  }

  return NextResponse.redirect(new URL("/", url.origin));
}
