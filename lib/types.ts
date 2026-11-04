// 数据库行类型定义（与 supabase/schema.sql 中的表结构对应）

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  role: "reader" | "author" | "admin";
  avatar_url?: string | null;
  cover_url?: string | null;
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
