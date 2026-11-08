// 證件類型與號碼格式校驗（依台灣現行證件格式）

export const ID_TYPES = [
  {
    value: "tw_id",
    label: "國民身分證",
    hint: "1 個英文字母 + 9 位數字，例：A123456789",
  },
  {
    value: "health_card",
    label: "健保卡",
    hint: "健保卡上的身分證號或 12 位卡號",
  },
  {
    value: "passport",
    label: "護照",
    hint: "護照號碼（英文字母 + 數字，6–15 碼）",
  },
  {
    value: "arc",
    label: "居留證",
    hint: "新式居留證號：1 個英文字母 + 9 位數字",
  },
  {
    value: "cn_id",
    label: "大陸身分證 / 居住證",
    hint: "18 位號碼",
  },
] as const;

export type IdType = (typeof ID_TYPES)[number]["value"];

export function idTypeLabel(type?: string | null): string {
  return ID_TYPES.find((t) => t.value === type)?.label ?? "證件";
}

// 台灣身分證字母對應碼（I / O / W 為特殊值）
const TW_LETTER: Record<string, number> = {
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17,
  I: 34, J: 18, K: 19, L: 20, M: 21, N: 22, O: 35, P: 23,
  Q: 24, R: 25, S: 26, T: 27, U: 28, V: 29, W: 32, X: 30,
  Y: 31, Z: 33,
};

/** 中華民國國民身分證：1 字母 + 性別碼(1/2) + 8 位數字 + 檢查碼 */
export function isValidTwId(id: string): boolean {
  const v = id.trim().toUpperCase();
  if (!/^[A-Z][12]\d{8}$/.test(v)) return false;
  const n = TW_LETTER[v[0]];
  if (!n) return false;
  let sum = Math.floor(n / 10) * 1 + (n % 10) * 9;
  for (let i = 1; i <= 8; i++) {
    sum += Number(v[i]) * (9 - i);
  }
  sum += Number(v[9]);
  return sum % 10 === 0;
}

/** 新式居留證：1 字母 + 9 位數字（第 2 碼多為 8 / 9），格式檢查即可 */
export function isValidArc(id: string): boolean {
  const v = id.trim().toUpperCase();
  return /^[A-Z]\d{9}$/.test(v) && TW_LETTER[v[0]] !== undefined;
}

/** 大陸身分證 / 臺灣居民居住證：18 位，GB11643 校驗位 */
export function isValidCnId(id: string): boolean {
  const value = id.trim().toUpperCase();
  if (!/^\d{17}[\dX]$/.test(value)) return false;
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const codes = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += Number(value[i]) * weights[i];
  }
  return codes[sum % 11] === value[17];
}

/** 健保卡：卡號為 12 位數字，實務上也常直接填身分證號 */
export function isValidHealthCard(id: string): boolean {
  const v = id.trim().toUpperCase();
  return /^\d{12}$/.test(v) || /^[A-Z][12]\d{8}$/.test(v);
}

/** 護照：1–2 個字母開頭，全長 6–15 碼 */
export function isValidPassport(id: string): boolean {
  const v = id.trim().toUpperCase();
  return /^[A-Z0-9]{6,15}$/.test(v) && /^[A-Z]/.test(v);
}

/** 依證件類型校驗，回傳錯誤訊息（通過時 msg 為空） */
export function validateIdNumber(
  type: string,
  id: string
): { ok: boolean; msg?: string } {
  const v = id.trim().toUpperCase();

  if (!v) return { ok: false, msg: "請填寫證件號碼" };

  switch (type) {
    case "tw_id":
      if (!isValidTwId(v)) {
        return {
          ok: false,
          msg: "身分證號格式不正確，應為 1 個英文字母 + 9 位數字（例：A123456789）",
        };
      }
      return { ok: true };

    case "arc":
      if (!isValidArc(v)) {
        return {
          ok: false,
          msg: "居留證號格式不正確，應為 1 個英文字母 + 9 位數字",
        };
      }
      return { ok: true };

    case "health_card":
      if (!isValidHealthCard(v)) {
        return {
          ok: false,
          msg: "健保卡號應為 12 位數字，或直接填身分證號",
        };
      }
      return { ok: true };

    case "passport":
      if (!isValidPassport(v)) {
        return {
          ok: false,
          msg: "護照號碼格式不正確，應為字母開頭、全長 6–15 碼",
        };
      }
      return { ok: true };

    case "cn_id":
      if (!isValidCnId(v)) {
        return {
          ok: false,
          msg: "號碼格式不正確，請填寫 18 位大陸身分證 / 居住證號碼",
        };
      }
      return { ok: true };

    default:
      return { ok: false, msg: "請先選擇證件類型" };
  }
}

// 脫敏顯示：姓名保留首字；證件號保留前 2 後 3
export function maskName(name: string): string {
  if (!name) return "";
  if (name.length <= 1) return name + "**";
  return name.slice(0, 1) + "*".repeat(name.length - 1);
}

export function maskId(id: string): string {
  if (!id) return "";
  const v = id.trim().toUpperCase();
  if (v.length <= 5) return v;
  return v.slice(0, 2) + "*".repeat(Math.max(v.length - 5, 2)) + v.slice(-3);
}
