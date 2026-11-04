import { Work, Chapter, Comment } from "@/lib/types";
import { createClient } from "./server";

type WorkRow = Work & { chapters?: { count: number }[]; favorites?: { count: number }[] };

function normalizeWork(row: WorkRow): Work {
  return {
    ...row,
    chapter_count: row.chapters?.[0]?.count ?? 0,
    favorite_count: row.favorites?.[0]?.count ?? 0,
  } as Work;
}

/** 获取已通过审核的作品列表（可选按分类/标签筛选、按阅读量排序） */
export async function getApprovedWorks(
  category?: string,
  limit = 20,
  sortBy: "latest" | "popular" = "latest",
  tag?: string
) {
  const supabase = await createClient();
  let query = supabase
    .from("works")
    .select("*, author:profiles!works_author_id_fkey(username, avatar_url), chapters(count), favorites(count)")
    .eq("status", "approved");

  if (sortBy === "popular") {
    query = query.order("view_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (category) {
    query = query.eq("category", category);
  }
  if (tag) {
    query = query.contains("tags", [tag]);
  }

  query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(normalizeWork);
}

/** 获取单个作品详情（含作者与章节列表） */
export async function getWorkWithChapters(id: string) {
  const supabase = await createClient();
  const { data: work, error: workError } = await supabase
    .from("works")
    .select("*, author:profiles!works_author_id_fkey(username, avatar_url)")
    .eq("id", id)
    .single();
  if (workError) throw workError;

  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("*")
    .eq("work_id", id)
    .order("chapter_order", { ascending: true });
  if (chaptersError) throw chaptersError;

  return { work: work as Work, chapters: (chapters ?? []) as Chapter[] };
}

/** 获取当前用户自己的作品列表 */
export async function getMyWorks(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("works")
    .select("*, chapters(count), favorites(count)")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizeWork);
}

/** 获取单个作品的收藏数 */
export async function getFavoriteCount(workId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("favorites")
    .select("id", { count: "exact", head: true })
    .eq("work_id", workId);
  if (error) throw error;
  return count ?? 0;
}

/** 判断某用户是否已收藏该作品 */
export async function getIsFavorited(workId: string, userId: string | null) {
  if (!userId) return false;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("work_id", workId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/** 获取作品的留言列表（带用户名） */
export async function getWorkComments(workId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, profile:profiles!comments_user_id_fkey(username)")
    .eq("work_id", workId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as Comment[];
}

/** 获取作者自己作品收到的全部留言（留言管理） */
export async function getMyWorksComments(userId: string) {
  const supabase = await createClient();
  const { data: myWorks } = await supabase
    .from("works")
    .select("id")
    .eq("author_id", userId);
  const workIds = (myWorks ?? []).map((w) => w.id);
  if (workIds.length === 0) return [];

  const { data, error } = await supabase
    .from("comments")
    .select("*, profile:profiles!comments_user_id_fkey(username), work:works!comments_work_id_fkey(title)")
    .in("work_id", workIds)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as (Comment & { work?: { title: string } | null })[];
}

/** 获取待审核作品列表（管理员） */
export async function getPendingWorks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("works")
    .select("*, author:profiles!works_author_id_fkey(username, avatar_url), chapters(count)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(normalizeWork);
}

/** 按审核状态获取作品列表（管理员查看已通过/已驳回） */
export async function getWorksByStatus(status: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("works")
    .select("*, author:profiles!works_author_id_fkey(username, avatar_url), chapters(count)")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map(normalizeWork);
}

/** 获取章节详情（含所属作品与上下章） */
export async function getChapterWithContext(
  workId: string,
  chapterId: string
) {
  const supabase = await createClient();
  const { data: work, error: workError } = await supabase
    .from("works")
    .select("*, author:profiles!works_author_id_fkey(username, avatar_url)")
    .eq("id", workId)
    .single();
  if (workError) throw workError;

  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("id, title, chapter_order")
    .eq("work_id", workId)
    .order("chapter_order", { ascending: true });
  if (chaptersError) throw chaptersError;

  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", chapterId)
    .eq("work_id", workId)
    .single();
  if (chapterError) throw chapterError;

  return { work: work as Work, chapter: chapter as Chapter, chapters: chapters as Chapter[] };
}
