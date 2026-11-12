import { createAdminClient } from "@/lib/supabase/admin";
import { verifyCheckMacValue } from "@/lib/ecpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 綠界付款完成後由伺服器端 POST 回呼（Server-to-Server）
 * 必須回傳純文字 "1|OK"，否則綠界會持續重試
 */
export async function POST(req: Request) {
  let params: Record<string, string> = {};

  try {
    const form = await req.formData();
    form.forEach((value, key) => {
      params[key] = String(value);
    });
  } catch {
    return new Response("0|BadRequest", { status: 400 });
  }

  // 1. 驗簽
  if (!verifyCheckMacValue(params)) {
    console.error("[ecpay] CheckMacValue 驗證失敗", params.MerchantTradeNo);
    return new Response("0|CheckMacValueError", { status: 400 });
  }

  const tradeNo = params.MerchantTradeNo;
  const rtnCode = params.RtnCode;
  const ecpayTradeNo = params.TradeNo ?? null;

  if (!tradeNo) return new Response("0|NoTradeNo", { status: 400 });

  // 2. 取得訂單
  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[ecpay] 缺少 service role key", err);
    return new Response("0|ServerConfigError", { status: 500 });
  }

  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, kind, work_id, chapter_id, author_id, amount, status")
    .eq("merchant_trade_no", tradeNo)
    .single();

  if (!order) return new Response("0|OrderNotFound", { status: 404 });

  // 3. 付款成功才處理（重複回呼直接回 OK）
  if (rtnCode === "1" && order.status !== "paid") {
    const now = new Date().toISOString();

    await admin
      .from("orders")
      .update({
        status: "paid",
        paid_at: now,
        ecpay_trade_no: ecpayTradeNo,
      })
      .eq("id", order.id);

    if (order.kind === "chapter" && order.chapter_id && order.work_id) {
      await admin.from("chapter_purchases").upsert(
        {
          user_id: order.user_id,
          chapter_id: order.chapter_id,
          work_id: order.work_id,
          order_id: order.id,
        },
        { onConflict: "user_id,chapter_id", ignoreDuplicates: true }
      );
    }
  } else if (rtnCode !== "1") {
    await admin
      .from("orders")
      .update({ status: "failed", ecpay_trade_no: ecpayTradeNo })
      .eq("id", order.id)
      .eq("status", "pending");
  }

  return new Response("1|OK", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
