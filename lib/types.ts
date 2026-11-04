// 数据库行类型定义（与 supabase/schema.sql 中的表结构对应）

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  role: "reader" | "author" | "admin";
  avatar_url?: string | null;
  cover_url?: string | null;
  // 实名认证信息
  real_name?: string | null;
  id_number?: string | null;
  id_address?: string | null;
  id_photo_url?: string | null;
  verify_status?: "pending" | "approved" | "rejected" | null;
  // 联系方式
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
  status: "pending" | "approved" | "rejected";
  reject_reason: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  // 作品标签（四大类中挑选）
  tags?: string[];
  // 联表查询时附带
  author?: { username: string | null; avatar_url?: string | null } | null;
  // 章节数（联表聚合时附带）
  chapter_count?: number;
  // 收藏数（联表聚合时附带）
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
  // 联表查询时附带
  profile?: { username: string | null } | null;
}

export interface Chapter {
  id: string;
  work_id: string;
  title: string;
  content: string;
  chapter_order: number;
  created_at: string;
}

export type WorkStatus = Work["status"];
