import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AUTHOR_SHARE_RATIO, TIP_MIN, TIP_MAX } from "@/lib/pay-config";
import {
  ECPAY_CONFIG,
  ecpayEndpoint,
  ecpayCheckMacValue,
  makeTradeNo,
  sanitizeEcpayText,
  taipeiNow,
} from "@/lib/ecpay";

export const runtime = "nodejs";

function siteUrl(req: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  const host = req.headers.get("host") ?? "mywhimsy.work";
  const proto = host.includes("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

function ecpayForm(params: Record<string, string>): Response {
  const inputs = Object.entries(params)
    .map(
      ([k, v]) =>
        `<input type="hidden" name="${k}" value="${v
          .replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;")}" />`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="zh-TW"><head><meta charset="utf-8" /><title>前往付款…</title>
<style>body{font-family:-apple-system,"Noto Sans TC",sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc;color:#334155}</style>
</head><body>
<div>正在前往綠界付款頁面…</div>
<form id="ecpay" method="post" action="${ecpayEndpoint()}">${inputs}</form>
<script>document.getElementById("ecpay").submit();</script>
</body></html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "請先登入才能付款" }, { status: 401 });
  }

  // 同時支援 JSON（fetch）與一般表單提交（瀏覽器直接 POST）
  type PayBody = {
    kind?: string;
    chapterId?: string;
    workId?: string;
    amount?: number | string;
    message?: string;
  };
  let body: PayBody = {};
  try {
    body = (await req.json()) as PayBody;
  } catch {
    try {
      const form = await req.formData();
      body = {
        kind: String(form.get("kind") ?? ""),
        chapterId: String(form.get("chapterId") ?? ""),
        workId: String(form.get("workId") ?? ""),
        amount: String(form.get("amount") ?? ""),
        message: String(form.get("message") ?? ""),
      };
    } catch {
      return NextResponse.json({ error: "參數格式錯誤" }, { status: 400 });
    }
  }

  const site = siteUrl(req);
  const tradeNo = makeTradeNo();

  /* ---------------- 章節購買 ---------------- */
  if (body.kind === "chapter") {
    if (!body.chapterId) {
      return NextResponse.json({ error: "缺少章節" }, { status: 400 });
    }

    const { data: chapter } = await supabase
      .from("chapters")
      .select("id, title, price, work_id")
      .eq("id", body.chapterId)
      .single();

    if (!chapter) {
      return NextResponse.json({ error: "章節不存在" }, { status: 404 });
    }
    if (!chapter.price || chapter.price <= 0) {
      return NextResponse.json({ error: "本章為免費章節" }, { status: 400 });
    }

    const { data: work } = await supabase
      .from("works")
      .select("id, title, author_id, status")
      .eq("id", chapter.work_id)
      .single();

    if (!work || work.status !== "approved") {
      return NextResponse.json({ error: "作品尚未上架" }, { status: 400 });
    }
    if (work.author_id === user.id) {
      return NextResponse.json(
        { error: "這是自己的作品，不需購買" },
        { status: 400 }
      );
    }

    const amount = chapter.price;
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        kind: "chapter",
        work_id: work.id,
        chapter_id: chapter.id,
        author_id: work.author_id,
        amount,
        author_share: Math.floor(amount * AUTHOR_SHARE_RATIO),
        status: "pending",
        merchant_trade_no: tradeNo,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { error: orderErr?.message ?? "建立訂單失敗" },
        { status: 500 }
      );
    }

    const itemName = sanitizeEcpayText(
      `${sanitizeEcpayText(work.title, 20)} 第${chapter.title}`
    );

    const params: Record<string, string> = {
      MerchantID: ECPAY_CONFIG.merchantId,
      MerchantTradeNo: tradeNo,
      MerchantTradeDate: taipeiNow(),
      PaymentType: "aio",
      TotalAmount: String(amount),
      TradeDesc: "鬼點子章節購買",
      ItemName: itemName,
      ReturnURL: `${site}/api/ecpay/return`,
      ClientBackURL: `${site}/api/ecpay/result?no=${tradeNo}`,
      ChoosePayment: "ALL",
      EncryptType: "1",
    };
    params.CheckMacValue = ecpayCheckMacValue(params);

    return ecpayForm(params);
  }

  /* ---------------- 打賞 ---------------- */
  if (body.kind === "tip") {
    const rawAmount = Number(body.amount);
    if (!Number.isInteger(rawAmount) || rawAmount < TIP_MIN || rawAmount > TIP_MAX) {
      return NextResponse.json(
        { error: `打賞金額需為 ${TIP_MIN}–${TIP_MAX} 元的整數` },
        { status: 400 }
      );
    }
    if (!body.workId) {
      return NextResponse.json({ error: "缺少作品" }, { status: 400 });
    }

    const { data: work } = await supabase
      .from("works")
      .select("id, title, author_id, status")
      .eq("id", body.workId)
      .single();

    if (!work || work.status !== "approved") {
      return NextResponse.json({ error: "作品尚未上架" }, { status: 400 });
    }
    if (work.author_id === user.id) {
      return NextResponse.json({ error: "不能打賞自己的作品" }, { status: 400 });
    }

    const message = (body.message ?? "").trim().slice(0, 120) || null;
    const { error: orderErr } = await supabase.from("orders").insert({
      user_id: user.id,
      kind: "tip",
      work_id: work.id,
      author_id: work.author_id,
      amount: rawAmount,
      author_share: Math.floor(rawAmount * AUTHOR_SHARE_RATIO),
      message,
      status: "pending",
      merchant_trade_no: tradeNo,
    });

    if (orderErr) {
      return NextResponse.json({ error: orderErr.message }, { status: 500 });
    }

    const params: Record<string, string> = {
      MerchantID: ECPAY_CONFIG.merchantId,
      MerchantTradeNo: tradeNo,
      MerchantTradeDate: taipeiNow(),
      PaymentType: "aio",
      TotalAmount: String(rawAmount),
      TradeDesc: "鬼點子作品打賞",
      ItemName: sanitizeEcpayText(`打賞 ${sanitizeEcpayText(work.title, 24)}`),
      ReturnURL: `${site}/api/ecpay/return`,
      ClientBackURL: `${site}/api/ecpay/result?no=${tradeNo}`,
      ChoosePayment: "ALL",
      EncryptType: "1",
    };
    params.CheckMacValue = ecpayCheckMacValue(params);

    return ecpayForm(params);
  }

  return NextResponse.json({ error: "不支援的付款類型" }, { status: 400 });
}
