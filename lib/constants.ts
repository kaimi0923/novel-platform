// 作品分類（可在後臺隨意增刪，前端按此列表展示）
export const CATEGORIES = [
  "都市",
  "言情",
  "玄幻",
  "仙俠",
  "懸疑",
  "科幻",
  "歷史",
  "校園",
  "遊戲",
  "短篇",
  "其他",
] as const;

// 作品標籤（四大類，參考網文平臺標籤體系；每類最多選 3 個）
export const TAG_GROUPS: { name: string; tags: string[] }[] = [
  {
    name: "風格",
    tags: [
      "熱血", "輕鬆", "暗黑", "現實題材", "虐戀", "治癒", "甜寵", "懸疑",
      "種田", "清穿", "宅鬥", "宮鬥", "中短篇", "青春", "軍事", "爽文",
      "恐怖", "燒腦", "正劇", "商戰", "權謀", "勵志", "搞笑", "日常",
      "短篇", "短故事", "買股文", "第一人稱", "純愛", "快節奏",
    ],
  },
  {
    name: "角色",
    tags: [
      "豪門總裁", "護花高手", "學生", "神豪", "皇帝", "女總裁", "皇后", "醫妃",
      "嫡女", "王爺", "首輔", "大叔", "律師", "特工", "仵作", "兵王",
      "仙帝", "贅婿", "奶爸", "道士", "校花", "王妃", "公主", "庶女",
      "太子", "醜女", "醫生", "吸血鬼", "法醫", "女配",
    ],
  },
  {
    name: "情節",
    tags: [
      "鑑寶", "透視", "無敵流", "召喚", "快穿", "隨身空間", "娛樂圈", "荒島求生",
      "逆襲", "一統天下", "聊天群", "御獸", "武魂", "風水", "破鏡重圓", "劍道",
      "美食", "爭霸", "盜墓", "穿書", "契約婚姻", "穿越", "家族崛起", "強者回歸",
      "直播", "紅包", "血脈", "丹藥", "青梅竹馬", "替嫁",
    ],
  },
  {
    name: "背景",
    tags: [
      "都市", "現代言情", "諸天萬界", "三國", "大唐", "水滸", "西遊", "漫威",
      "火影", "海賊王", "英雄聯盟", "絕地求生", "王者榮耀", "武俠", "靈氣復甦", "神奇寶貝",
      "奧特曼", "末世", "洪荒", "玄幻", "仙俠", "異界", "西幻", "奇幻",
      "年代", "民國", "校園", "古代", "架空歷史", "遠古",
    ],
  },
];

export const STATUS_LABEL: Record<string, string> = {
  pending: "待稽核",
  approved: "已透過",
  rejected: "未透過",
};

export const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

// 短劇內容分級（依台灣《電腦網路內容分級處理辦法》與兒少法）
export const CONTENT_RATINGS = [
  { value: "general", label: "普遍級", desc: "所有年齡皆可觀賞" },
  { value: "protected", label: "保護級", desc: "未滿 6 歲不宜觀賞，6–12 歲需家長陪同" },
  { value: "pg12", label: "輔12級", desc: "未滿 12 歲不宜觀賞" },
  { value: "pg15", label: "輔15級", desc: "未滿 15 歲不宜觀賞" },
  { value: "restricted", label: "限制級", desc: "未滿 18 歲不得觀賞" },
] as const;

export type ContentRating = (typeof CONTENT_RATINGS)[number]["value"];

export const RATING_LABEL: Record<string, string> = Object.fromEntries(
  CONTENT_RATINGS.map((r) => [r.value, r.label])
);

export const RATING_BADGE: Record<string, string> = {
  general: "bg-emerald-100 text-emerald-700",
  protected: "bg-sky-100 text-sky-700",
  pg12: "bg-amber-100 text-amber-700",
  pg15: "bg-orange-100 text-orange-700",
  restricted: "bg-rose-100 text-rose-700",
};

// 檢舉原因選項
export const REPORT_REASONS = [
  "內容涉及色情或猥褻",
  "內容有害兒童及少年身心健康",
  "涉及暴力、自傷或犯罪教學",
  "侵犯著作權",
  "不實資訊或詐騙",
  "其他",
] as const;
