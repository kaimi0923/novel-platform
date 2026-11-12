-- 增量：付費體系（打賞 + 章節收費 + 作者提現）
-- 既有庫可直接整段貼進 SQL Editor 執行（含 if not exists 保護）
-- ============================================================

-- 1) 章節售價（0 = 免費；單位新台幣）
alter table public.chapters
  add column if not exists price integer not null default 0;

-- 2) 訂單（章節購買 chapter / 打賞 tip）
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('chapter', 'tip')),
  work_id uuid references public.works (id) on delete cascade,
  chapter_id uuid references public.chapters (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  amount integer not null check (amount > 0),
  author_share integer not null default 0,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed')),
  merchant_trade_no text unique,
  ecpay_trade_no text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists orders_author_status_idx
  on public.orders (author_id, status, paid_at desc);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

alter table public.orders enable row level security;

drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders for select
  using (
    auth.uid() = user_id
    or auth.uid() = author_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 只能建立自己的待付款訂單；金額與狀態由伺服器控制
drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders for insert
  with check (auth.uid() = user_id and status = 'pending');

-- 訂單狀態只允許 service_role（金流回調）更新，不開放前端 update

-- 3) 章節購買紀錄（付款成功才寫入，由 service_role 寫）
create table if not exists public.chapter_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  work_id uuid not null references public.works (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);

create index if not exists chapter_purchases_user_idx
  on public.chapter_purchases (user_id, chapter_id);

alter table public.chapter_purchases enable row level security;

drop policy if exists "chapter_purchases_select" on public.chapter_purchases;
create policy "chapter_purchases_select" on public.chapter_purchases for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 不開放前端 insert（避免偽造購買），僅 service_role 可寫

-- 4) 提現申請
create table if not exists public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  amount integer not null check (amount > 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'rejected')),
  note text,
  requested_at timestamptz not null default now(),
  handled_by uuid references public.profiles (id) on delete set null,
  handled_at timestamptz
);

create index if not exists payout_requests_author_idx
  on public.payout_requests (author_id, requested_at desc);
create index if not exists payout_requests_status_idx
  on public.payout_requests (status, requested_at desc);

alter table public.payout_requests enable row level security;

drop policy if exists "payout_requests_select" on public.payout_requests;
create policy "payout_requests_select" on public.payout_requests for select
  using (
    auth.uid() = author_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "payout_requests_insert_own" on public.payout_requests;
create policy "payout_requests_insert_own" on public.payout_requests for insert
  with check (auth.uid() = author_id and status = 'pending');

-- 管理員可更新處理狀態
drop policy if exists "payout_requests_update_admin" on public.payout_requests;
create policy "payout_requests_update_admin" on public.payout_requests for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 5) 表權限（Supabase 專案若未自動 grant，缺這段前端會讀不到；RLS 仍會限制可見資料）
grant select, insert, update, delete on public.orders to anon, authenticated, service_role;
grant select, insert, update, delete on public.chapter_purchases to anon, authenticated, service_role;
grant select, insert, update, delete on public.payout_requests to anon, authenticated, service_role;
