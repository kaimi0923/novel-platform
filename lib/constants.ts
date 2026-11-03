// 作品分类（可在后台随意增删，前端按此列表展示）
export const CATEGORIES = [
  "都市",
  "言情",
  "玄幻",
  "仙侠",
  "悬疑",
  "科幻",
  "历史",
  "校园",
  "游戏",
  "短篇",
  "其他",
] as const;

export const STATUS_LABEL: Record<string, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "未通过",
};

export const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};
