// 大陸身份證 / 臺灣居民居住證號碼校驗（18 位，GB11643 校驗位演算法）
// 臺灣居民居住證號碼同樣為 18 位、同編碼體系，校驗規則一致。
export function isValidIdNumber(id: string): boolean {
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

// 脫敏顯示：姓名保留首字，證件號保留前3後4
export function maskName(name: string): string {
  if (!name) return "";
  if (name.length <= 1) return name + "**";
  return name.slice(0, 1) + "*".repeat(name.length - 1);
}
export function maskId(id: string): string {
  if (!id) return "";
  if (id.length <= 7) return id;
  return id.slice(0, 3) + "*".repeat(id.length - 7) + id.slice(-4);
}
