// 資料庫行型別定義（與 supabase/schema.sql 中的表結構對應）

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  role: "reader" | "author" | "admin";
  avatar_url?: string | null;
  cover_url?: string | null;
  // 實名認證資訊
  real_name?: string | null;
  id_number?: string | null;
  /** 證件類型：tw_id 身分證 / health_card 健保卡 / passport 護照 / arc 居留證 / cn_id 大陸證件 */
  id_type?: string | null;
  id_address?: string | null;
  id_photo_url?: string | null;
  verify_status?: "pending" | "approved" | "rejected" | null;
  // 聯絡方式
  qq?: string | null;
  wechat?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  shipping_address?: string | null;
  created_at: string;
}

export interface Work {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  category: string;
  /** 作品型別：novel 小說 / art 插畫 / comic 漫畫 / drama 短劇 */
  type?: "novel" | "art" | "comic" | "drama";
  status: "pending" | "approved" | "rejected";
  reject_reason: string | null;
  view_count: number;
  /** 是否已完結 */
  is_completed?: boolean;
  /** 正文字數（自動統計） */
  word_count?: number;
  /** 平均評分（1-5） */
  rating_average?: number;
  /** 打分人數 */
  rating_count?: number;
  /** 內容分級（短劇）：general 普遍 / protected 保護 / pg12 輔12 / pg15 輔15 / restricted 限制 */
  content_rating?: string;
  created_at: string;
  updated_at: string;
  // 作品標籤（四大類中挑選）
  tags?: string[];
  // 聯表查詢時附帶
  author?: { username: string | null; avatar_url?: string | null } | null;
  // 章節數（聯表聚合時附帶）
  chapter_count?: number;
  // 短劇集數（聯表聚合時附帶）
  episode_count?: number;
  // 收藏數（聯表聚合時附帶）
  favorite_count?: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  work_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  work_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // 聯表查詢時附帶
  profile?: { username: string | null } | null;
}

export interface Chapter {
  id: string;
  work_id: string;
  title: string;
  content: string;
  chapter_order: number;
  /** 章節插圖（圖片 URL 列表，可選） */
  images?: string[];
  created_at: string;
}

export type WorkStatus = Work["status"];

/** 短劇的一集 */
export interface Episode {
  id: string;
  work_id: string;
  /** 第幾集（從 1 開始） */
  episode_order: number;
  title: string | null;
  video_url: string;
  cover_url: string | null;
  /** 時長（秒） */
  duration: number | null;
  created_at: string;
}
