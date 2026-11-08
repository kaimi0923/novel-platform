import { Work, Chapter, Comment } from "@/lib/types";
import { createClient } from "./server";

type WorkRow = Work & {
  chapters?: { count: number }[];
  favorites?: { count: number }[];
  episodes?: { count: number }[];
};

function normalizeWork(row: WorkRow): Work {
  return {
    ...row,
    chapter_count: row.chapters?.[0]?.count ?? 0,
    favorite_count: row.favorites?.[0]?.count ?? 0,
    episode_count: row.episodes?.[0]?.count ?? 0,
  } as Work;
}

/** 获取已通过审核的作品列表（可选按分类/标签/类型筛选、按阅读量排序） */
export async function getApprovedWorks(
  category?: string,
  limit = 20,
  sortBy: "latest" | "popular" = "latest",
  tag?: string,
  type?: "novel" | "art" | "comic" | "drama"
) {
  const supabase = await createClient();
  let query = supabase
    .from("works")
    .select("*, author:profiles!works_author_id_fkey(username, avatar_url), chapters(count), favorites(count), episodes(count)")
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
  if (type) {
    query = query.eq("type", type);
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

/** 获取我收藏的作品（按收藏时间倒序，含作者信息） */
export async function getMyFavorites(userId: string) {
  const supabase = await createClient();
  const { data: favs, error: favError } = await supabase
    .from("favorites")
    .select("work_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (favError) throw favError;

  const workIds = (favs ?? []).map((f) => f.work_id);
  if (workIds.length === 0) return [];

  const { data: works, error: worksError } = await supabase
    .from("works")
    .select(
      "*, author:profiles!works_author_id_fkey(username, avatar_url), chapters(count), favorites(count)"
    )
    .in("id", workIds);
  if (worksError) throw worksError;

  const workMap = new Map(
    (works ?? []).map((w) => [(w as WorkRow).id, w as WorkRow])
  );

  return (favs ?? [])
    .map((f) => {
      const work = workMap.get(f.work_id);
      if (!work) return null;
      return { ...normalizeWork(work), favorited_at: f.created_at };
    })
    .filter((w): w is Work & { favorited_at: string } => w !== null);
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

/** 获取我对某作品的评分（未打分返回 null） */
export async function getMyRating(workId: string, userId: string | null) {
  if (!userId) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("work_ratings")
    .select("score")
    .eq("work_id", workId)
    .eq("user_id", userId)
    .maybeSingle();
  // 评分表未建立时降级为未评分
  if (error) return null;
  return data?.score ?? null;
}

/** 我是否已关注该作者 */
export async function getIsFollowing(authorId: string, userId: string | null) {
  if (!userId || userId === authorId) return false;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", userId)
    .eq("following_id", authorId)
    .maybeSingle();
  // 关注表未建立时降级为未关注，不影响页面
  if (error) return false;
  return !!data;
}

/** 获取我关注的作者列表（含其最新作品缩略） */
export async function getMyFollowing(userId: string) {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("follows")
    .select("following_id, created_at")
    .eq("follower_id", userId)
    .order("created_at", { ascending: false });
  if (error || !rows || rows.length === 0) return [];

  const ids = rows.map((r) => r.following_id);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", ids);

  const { data: works } = await supabase
    .from("works")
    .select("id, title, cover_url, author_id, created_at")
    .in("author_id", ids)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const worksByAuthor = new Map<
    string,
    { id: string; title: string; cover_url: string | null }[]
  >();
  for (const w of works ?? []) {
    const list = worksByAuthor.get(w.author_id) ?? [];
    if (list.length < 3) {
      list.push({ id: w.id, title: w.title, cover_url: w.cover_url });
      worksByAuthor.set(w.author_id, list);
    }
  }

  return rows
    .map((r) => {
      const p = profileMap.get(r.following_id);
      if (!p) return null;
      return {
        id: p.id,
        username: p.username as string | null,
        avatar_url: (p.avatar_url ?? null) as string | null,
        followed_at: r.created_at as string,
        works: worksByAuthor.get(p.id) ?? [],
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
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

/* ============================================================
 * 管理后台统计与会员资料
 * ============================================================ */

export interface AdminOverview {
  memberCount: number;
  authorCount: number;
  readerCount: number;
  adminCount: number;
  totalWorks: number;
  approvedWorks: number;
  pendingWorks: number;
  rejectedWorks: number;
  totalViews: number;
  favoriteCount: number;
  followCount: number;
  pendingVerify: number;
  todayNewMembers: number;
}

/** 管理后台总览数据 */
export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = await createClient();

  const [{ data: profiles }, { data: works }, favRes, followRes] =
    await Promise.all([
      supabase.from("profiles").select("id, role, verify_status, created_at"),
      supabase.from("works").select("author_id, status, view_count"),
      supabase.from("favorites").select("id", { count: "exact", head: true }),
      supabase.from("follows").select("id", { count: "exact", head: true }),
    ]);

  const rows = profiles ?? [];
  const workRows = works ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    memberCount: rows.length,
    authorCount: new Set(workRows.map((w) => w.author_id)).size,
    readerCount: rows.filter((p) => p.role === "reader").length,
    adminCount: rows.filter((p) => p.role === "admin").length,
    totalWorks: workRows.length,
    approvedWorks: workRows.filter((w) => w.status === "approved").length,
    pendingWorks: workRows.filter((w) => w.status === "pending").length,
    rejectedWorks: workRows.filter((w) => w.status === "rejected").length,
    totalViews: workRows.reduce((sum, w) => sum + Number(w.view_count ?? 0), 0),
    favoriteCount: favRes.count ?? 0,
    followCount: followRes.count ?? 0,
    pendingVerify: rows.filter((p) => p.verify_status === "pending").length,
    todayNewMembers: rows.filter(
      (p) => new Date(p.created_at as string) >= today
    ).length,
  };
}

export interface AdminMember {
  id: string;
  email: string | null;
  username: string | null;
  role: string;
  avatar_url: string | null;
  real_name: string | null;
  id_number: string | null;
  id_address: string | null;
  id_photo_url: string | null;
  verify_status: string | null;
  qq: string | null;
  wechat: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  shipping_address: string | null;
  created_at: string;
  workCount: number;
  publishedCount: number;
  pendingCount: number;
  totalViews: number;
  followerCount: number;
  followingCount: number;
  works: { id: string; title: string; status: string; type: string | null }[];
}

/** 会员与作家资料（管理员） */
export async function getAdminMembers(): Promise<AdminMember[]> {
  const supabase = await createClient();

  const [{ data: profiles }, { data: works }, { data: follows }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, email, username, role, avatar_url, real_name, id_number, id_address, id_photo_url, verify_status, qq, wechat, contact_email, contact_phone, shipping_address, created_at"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("works")
        .select("id, title, author_id, status, type, view_count")
        .order("created_at", { ascending: false }),
      supabase.from("follows").select("follower_id, following_id"),
    ]);

  const followRows = follows ?? [];
  const worksByAuthor = new Map<string, typeof works>();
  for (const w of works ?? []) {
    const list = worksByAuthor.get(w.author_id) ?? [];
    list.push(w);
    worksByAuthor.set(w.author_id, list);
  }

  return (profiles ?? []).map((p) => {
    const mine = (worksByAuthor.get(p.id) ?? []).filter(Boolean) as {
      id: string;
      title: string;
      status: string;
      type: string | null;
      view_count: number | null;
    }[];
    return {
      id: p.id,
      email: p.email ?? null,
      username: p.username ?? null,
      role: p.role ?? "reader",
      avatar_url: p.avatar_url ?? null,
      real_name: p.real_name ?? null,
      id_number: p.id_number ?? null,
      id_address: p.id_address ?? null,
      id_photo_url: p.id_photo_url ?? null,
      verify_status: p.verify_status ?? null,
      qq: p.qq ?? null,
      wechat: p.wechat ?? null,
      contact_email: p.contact_email ?? null,
      contact_phone: p.contact_phone ?? null,
      shipping_address: p.shipping_address ?? null,
      created_at: p.created_at as string,
      workCount: mine.length,
      publishedCount: mine.filter((w) => w.status === "approved").length,
      pendingCount: mine.filter((w) => w.status === "pending").length,
      totalViews: mine.reduce((s, w) => s + Number(w.view_count ?? 0), 0),
      followerCount: followRows.filter((f) => f.following_id === p.id).length,
      followingCount: followRows.filter((f) => f.follower_id === p.id).length,
      works: mine.map((w) => ({
        id: w.id,
        title: w.title,
        status: w.status,
        type: w.type ?? null,
      })),
    };
  });
}

/* ------------------------------------------------------------------ */
/* 个人中心：数据分析 / 浏览记录                                        */
/* ------------------------------------------------------------------ */

export interface MyStats {
  workCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  totalViews: number;
  totalFavorites: number;
  totalChapters: number;
  followerCount: number;
  followingCount: number;
  works: Work[];
}

/** 我的数据分析（个人作品与粉丝统计） */
export async function getMyStats(userId: string): Promise<MyStats> {
  const supabase = await createClient();

  let works: Work[] = [];
  try {
    works = await getMyWorks(userId);
  } catch {
    works = [];
  }

  let followerCount = 0;
  let followingCount = 0;
  try {
    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", userId),
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", userId),
    ]);
    followerCount = followers ?? 0;
    followingCount = following ?? 0;
  } catch {
    // 忽略关注数获取失败
  }

  return {
    workCount: works.length,
    approvedCount: works.filter((w) => w.status === "approved").length,
    pendingCount: works.filter((w) => w.status === "pending").length,
    rejectedCount: works.filter((w) => w.status === "rejected").length,
    totalViews: works.reduce((s, w) => s + Number(w.view_count ?? 0), 0),
    totalFavorites: works.reduce((s, w) => s + Number(w.favorite_count ?? 0), 0),
    totalChapters: works.reduce((s, w) => s + Number(w.chapter_count ?? 0), 0),
    followerCount,
    followingCount,
    works: [...works].sort(
      (a, b) => Number(b.view_count ?? 0) - Number(a.view_count ?? 0)
    ),
  };
}

/** 记录一次作品浏览（表不存在或失败时静默忽略） */
export async function recordView(userId: string, workId: string) {
  try {
    const supabase = await createClient();
    await supabase.from("view_history").upsert(
      {
        user_id: userId,
        work_id: workId,
        viewed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,work_id" }
    );
  } catch {
    // 浏览记录表可能尚未创建，不影响正常阅读
  }
}

export type HistoryWork = Work & { viewed_at: string };

/** 我的浏览记录（最近浏览的作品） */
export async function getMyHistory(
  userId: string,
  limit = 30
): Promise<HistoryWork[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("view_history")
      .select("work_id, viewed_at")
      .eq("user_id", userId)
      .order("viewed_at", { ascending: false })
      .limit(limit);
    if (error) return [];

    const rows = data ?? [];
    if (rows.length === 0) return [];

    const workIds = rows.map((r) => r.work_id as string);
    const { data: works } = await supabase
      .from("works")
      .select(
        "*, author:profiles!works_author_id_fkey(username, avatar_url), chapters(count), favorites(count), episodes(count)"
      )
      .in("id", workIds);

    const workMap = new Map(
      (works ?? []).map((w) => [(w as WorkRow).id, normalizeWork(w as WorkRow)])
    );

    return rows
      .map((r) => {
        const work = workMap.get(r.work_id as string);
        if (!work) return null;
        return { ...work, viewed_at: r.viewed_at as string };
      })
      .filter((w): w is HistoryWork => w !== null);
  } catch {
    return [];
  }
}

