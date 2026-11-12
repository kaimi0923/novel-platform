import { createHash } from "crypto";

/**
 * 綠界 ECPay AIO 金流工具
 * - 測試環境預設使用官方公開測試帳號（2000132）
 * - 正式上線只需在環境變數填入自己的商店代號即可，程式不用改
 */
export const ECPAY_CONFIG = {
  merchantId: process.env.ECPAY_MERCHANT_ID ?? "2000132",
  hashKey: process.env.ECPAY_HASH_KEY ?? "5294y06JbISpM5x9",
  hashIV: process.env.ECPAY_HASH_IV ?? "v77hoKGq4kWxNNIS",
  isProduction: process.env.ECPAY_ENV === "production",
};

export function ecpayEndpoint(): string {
  return ECPAY_CONFIG.isProduction
    ? "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5"
    : "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5";
}

/** .NET 風格的 URL encode（綠界簽章要求） */
function dotnetUrlEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/%20/g, "+")
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A")
    .replace(/~/g, "%7E");
}

/** 產生 CheckMacValue（SHA256） */
export function ecpayCheckMacValue(
  params: Record<string, string | number>
): string {
  const entries = Object.entries(params)
    .filter(([key]) => key !== "CheckMacValue")
    .map(([key, value]) => [key, String(value)] as [string, string])
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

  let raw = `HashKey=${ECPAY_CONFIG.hashKey}`;
  for (const [key, value] of entries) raw += `&${key}=${value}`;
  raw += `&HashIV=${ECPAY_CONFIG.hashIV}`;

  const encoded = dotnetUrlEncode(raw).toLowerCase();
  return createHash("sha256").update(encoded, "utf8").digest("hex").toUpperCase();
}

/** 驗證綠界回傳的簽章 */
export function verifyCheckMacValue(
  params: Record<string, string>
): boolean {
  const got = params.CheckMacValue;
  if (!got) return false;
  const expected = ecpayCheckMacValue(params);
  return got.toUpperCase() === expected.toUpperCase();
}

/** 台北時間 yyyy/MM/dd HH:mm:ss */
export function taipeiNow(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return `${map.year}/${map.month}/${map.day} ${map.hour}:${map.minute}:${map.second}`;
}

/** 綠界訂單編號：只允許英數，最長 20 碼 */
export function makeTradeNo(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MW${t}${r}`.slice(0, 20);
}

/** 綠界對 ItemName / TradeDesc 有字元與長度限制，先清理 */
export function sanitizeEcpayText(input: string, max = 60): string {
  return input
    .replace(/[\r\n|]/g, " ")
    .replace(/['`]/g, "")
    .replace(/~/g, "-")
    .trim()
    .slice(0, max) || "鬼點子數位內容";
}
