-- ============================================================
-- 鬼点子 · 小说投稿平台数据库脚本
-- 使用方式：登录 Supabase 控制台 → SQL Editor → 粘贴全部执行
-- ============================================================

-- ---------- 1. 用户档案表 ----------
create table if not exists public.profiles (
  id uuid references auth.users (id) on delete cascade primary key,
  email text unique not null,
  username text unique,
  role text not null default 'reader'
    check (role in ('reader', 'author', 'admin')),
  created_at timestamptz not null default now()
);

-- ---------- 2. 作品表 ----------
create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete cascade not null,
  title text not null check (char_length(title) between 1 and 50),
  description text,
  cover_url text,
  category text not null default '其他',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reject_reason text,
  view_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists works_status_idx on public.works (status);
create index if not exists works_category_idx on public.works (category);
create index if not exists works_author_idx on public.works (author_id);

-- ---------- 3. 章节表 ----------
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  work_id uuid references public.works (id) on delete cascade not null,
  title text not null check (char_length(title) between 1 and 80),
  content text not null check (char_length(content) > 0),
  chapter_order integer not null,
  created_at timestamptz not null default now(),
  unique (work_id, chapter_order)
);

create index if not exists chapters_work_idx on public.chapters (work_id, chapter_order);

-- ---------- 4. 注册时自动创建用户档案 ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- 5. 作品更新时自动刷新 updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists works_set_updated_at on public.works;
create trigger works_set_updated_at
  before update on public.works
  for each row execute procedure public.set_updated_at();

-- ---------- 6. 浏览计数函数（游客也可调用，避免 RLS 冲突） ----------
create or replace function public.increment_view_count(work_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.works set view_count = view_count + 1 where id = work_id;
end;
$$;

-- ---------- 7. 行级安全策略（RLS） ----------

-- 7.1 profiles：所有人可读公开信息，本人可修改
alter table public.profiles enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- 7.2 works：已通过的作品所有人可读；作者可管理自己的作品；管理员可管理全部
alter table public.works enable row level security;

drop policy if exists "works_select" on public.works;
create policy "works_select" on public.works
  for select using (
    status = 'approved'
    or auth.uid() = author_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "works_insert_own" on public.works;
create policy "works_insert_own" on public.works
  for insert with check (
    auth.uid() = author_id
    and status = 'pending'
  );

drop policy if exists "works_update" on public.works;
create policy "works_update" on public.works
  for update using (
    auth.uid() = author_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "works_delete_own" on public.works;
create policy "works_delete_own" on public.works
  for delete using (
    auth.uid() = author_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 7.3 chapters：作品可见则章节可见；作者可增删改自己的章节；管理员可管理全部
alter table public.chapters enable row level security;

drop policy if exists "chapters_select" on public.chapters;
create policy "chapters_select" on public.chapters
  for select using (
    exists (
      select 1 from public.works w
      where w.id = chapters.work_id
        and (
          w.status = 'approved'
          or w.author_id = auth.uid()
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'admin'
          )
        )
    )
  );

drop policy if exists "chapters_insert_own" on public.chapters;
create policy "chapters_insert_own" on public.chapters
  for insert with check (
    exists (
      select 1 from public.works w
      where w.id = chapters.work_id
        and w.author_id = auth.uid()
    )
  );

drop policy if exists "chapters_update_delete" on public.chapters;
create policy "chapters_update_delete" on public.chapters
  for update using (
    exists (
      select 1 from public.works w
      where w.id = chapters.work_id
        and (
          w.author_id = auth.uid()
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'admin'
          )
        )
    )
  );

drop policy if exists "chapters_delete" on public.chapters;
create policy "chapters_delete" on public.chapters
  for delete using (
    exists (
      select 1 from public.works w
      where w.id = chapters.work_id
        and (
          w.author_id = auth.uid()
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'admin'
          )
        )
    )
  );

-- ---------- 8. 设置管理员（替换成你的邮箱后执行） ----------
-- update public.profiles set role = 'admin' where email = '你的邮箱@example.com';

-- ============================================================
-- 以下为收藏与留言功能（2026-11-04 新增）
-- ============================================================

-- ---------- 9. 收藏表 ----------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  work_id uuid references public.works (id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (user_id, work_id)
);

create index if not exists favorites_work_idx on public.favorites (work_id);
create index if not exists favorites_user_idx on public.favorites (user_id);

alter table public.favorites enable row level security;

-- 所有人可读收藏记录（用于展示收藏数）；仅本人可收藏/取消
drop policy if exists "favorites_select" on public.favorites;
create policy "favorites_select" on public.favorites
  for select using (true);

drop policy if exists "favorites_insert" on public.favorites;
create policy "favorites_insert" on public.favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "favorites_delete" on public.favorites;
create policy "favorites_delete" on public.favorites
  for delete using (auth.uid() = user_id);

-- ---------- 10. 留言表 ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  work_id uuid references public.works (id) on delete cascade not null,
  user_id uuid references auth.users (id) on delete cascade not null,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists comments_work_idx on public.comments (work_id);

alter table public.comments enable row level security;

-- 作品可见则留言可见；登录用户可留言；作者/管理员可删除留言
drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments
  for select using (
    exists (
      select 1 from public.works w
      where w.id = comments.work_id
        and (
          w.status = 'approved'
          or w.author_id = auth.uid()
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'admin'
          )
        )
    )
  );

drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert" on public.comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "comments_delete" on public.comments;
create policy "comments_delete" on public.comments
  for delete using (
    exists (
      select 1 from public.works w
      where w.id = comments.work_id
        and (
          w.author_id = auth.uid()
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'admin'
          )
        )
    )
  );

-- ---------- 11. 新表授权 ----------
grant select, insert, delete on table public.favorites to anon, authenticated;
grant select, insert, delete on table public.comments to anon, authenticated;
