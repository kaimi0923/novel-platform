/**
 * 金流與分潤設定
 * 之後要調抽成比例或提現門檻，改這裡就好
 */

/** 作者分潤比例（其餘為平台抽成） */
export const AUTHOR_SHARE_RATIO = 0.7;

/** 提現門檻（新台幣） */
export const MIN_PAYOUT = 1000;

/** 打賞預設金額 */
export const TIP_PRESETS = [50, 100, 200, 500];

/** 打賞金額上下限 */
export const TIP_MIN = 10;
export const TIP_MAX = 5000;

/** 章節售價上限（單章） */
export const CHAPTER_PRICE_MAX = 300;

export const TWD = "NT$";

export function formatTwd(amount: number): string {
  return `${TWD}${amount.toLocaleString("zh-TW")}`;
}
