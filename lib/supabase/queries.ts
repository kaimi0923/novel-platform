import { Work, Chapter } from "@/lib/types";
import { createClient } from "./server";

type WorkRow = Work & { chapters?: { count: number }[] };

function normalizeWork(row: WorkRow): Work {
  return {
    ...row,
    chapter_count: row.chapters?.[0]?.count ?? 0,
  } as Work;
}

/** 获取已通过审核的作品列表（可选按分类筛选） */
export async function getApprovedWorks(category?: string, limit = 20) {
  const supabase = await createClient();
  let query = supabase
    .from("works")
    .select("*, author:profiles!works_author_id_fkey(username), chapters(count)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(normalizeWork);
}

/** 获取单个作品详情（含作者与章节列表） */
export async function getWorkWithChapters(id: string) {
  const supabase = await createClient();
  const { data: work, error: workError } = await supabase
    .from("works")
    .select("*, author:profiles!works_author_id_fkey(username)")
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
    .select("*, chapters(count)")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizeWork);
}

/** 获取待审核作品列表（管理员） */
export async function getPendingWorks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("works")
    .select("*, author:profiles!works_author_id_fkey(username), chapters(count)")
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
    .select("*, author:profiles!works_author_id_fkey(username), chapters(count)")
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
    .select("*, author:profiles!works_author_id_fkey(username)")
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
