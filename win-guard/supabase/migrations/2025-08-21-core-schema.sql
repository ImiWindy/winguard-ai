-- Win Guard Core Schema (Idempotent)
-- - Users (profiles)
-- - Trades
-- - Trading Sessions
-- - AI Analysis
-- - Reports
-- Security: RLS owner-only CRUD
-- Performance: indexes, updated_at triggers
-- User sync: trigger to mirror auth.users → public.users

-- Extensions
create extension if not exists pgcrypto;

-- Enums (idempotent)
do $$ begin
  if not exists (select 1 from pg_type where typname = 'feeling_enum') then
    create type feeling_enum as enum ('Fear','Greed','Neutral');
  end if;
  if not exists (select 1 from pg_type where typname = 'report_type_enum') then
    create type report_type_enum as enum ('daily','weekly','monthly');
  end if;
end $$;

-- Helper function to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Users table (profiles) mirroring auth.users
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.users enable row level security;

-- Users RLS policies (owner-only CRUD)
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_select_own') then
    create policy users_select_own on public.users for select using (id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_insert_own') then
    create policy users_insert_own on public.users for insert with check (id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_update_own') then
    create policy users_update_own on public.users for update using (id = auth.uid()) with check (id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_delete_own') then
    create policy users_delete_own on public.users for delete using (id = auth.uid());
  end if;
end $$;

create index if not exists idx_users_email on public.users (email);

-- updated_at trigger for users
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'users_set_updated_at') then
    create trigger users_set_updated_at before update on public.users
    for each row execute procedure public.set_updated_at();
  end if;
end $$;

-- Trades table
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  symbol text not null,
  entry_price numeric not null,
  exit_price numeric not null,
  position_size numeric not null,
  feeling feeling_enum not null default 'Neutral',
  screenshot_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.trades enable row level security;

-- Trades RLS policies
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trades' and policyname='trades_select_own') then
    create policy trades_select_own on public.trades for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trades' and policyname='trades_insert_own') then
    create policy trades_insert_own on public.trades for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trades' and policyname='trades_update_own') then
    create policy trades_update_own on public.trades for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trades' and policyname='trades_delete_own') then
    create policy trades_delete_own on public.trades for delete using (auth.uid() = user_id);
  end if;
end $$;

-- Trades indexes
create index if not exists idx_trades_user_created_at on public.trades (user_id, created_at desc);
create index if not exists idx_trades_user_symbol on public.trades (user_id, symbol);

-- updated_at trigger for trades
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'trades_set_updated_at') then
    create trigger trades_set_updated_at before update on public.trades
    for each row execute procedure public.set_updated_at();
  end if;
end $$;

-- Trading Sessions (optional)
create table if not exists public.trading_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  session_start timestamptz not null,
  session_end timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.trading_sessions enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trading_sessions' and policyname='sessions_select_own') then
    create policy sessions_select_own on public.trading_sessions for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trading_sessions' and policyname='sessions_insert_own') then
    create policy sessions_insert_own on public.trading_sessions for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trading_sessions' and policyname='sessions_update_own') then
    create policy sessions_update_own on public.trading_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trading_sessions' and policyname='sessions_delete_own') then
    create policy sessions_delete_own on public.trading_sessions for delete using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists idx_sessions_user_created_at on public.trading_sessions (user_id, created_at desc);

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'trading_sessions_set_updated_at') then
    create trigger trading_sessions_set_updated_at before update on public.trading_sessions
    for each row execute procedure public.set_updated_at();
  end if;
end $$;

-- AI Analysis
create table if not exists public.ai_analysis (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references public.trades(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  discipline_score int check (discipline_score between 1 and 100),
  emotional_state text,
  mistakes_detected text,
  suggestions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.ai_analysis enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ai_analysis' and policyname='ai_select_own') then
    create policy ai_select_own on public.ai_analysis for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ai_analysis' and policyname='ai_insert_own') then
    create policy ai_insert_own on public.ai_analysis for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ai_analysis' and policyname='ai_update_own') then
    create policy ai_update_own on public.ai_analysis for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ai_analysis' and policyname='ai_delete_own') then
    create policy ai_delete_own on public.ai_analysis for delete using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists idx_ai_user_created_at on public.ai_analysis (user_id, created_at desc);
create index if not exists idx_ai_trade_id on public.ai_analysis (trade_id);

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'ai_analysis_set_updated_at') then
    create trigger ai_analysis_set_updated_at before update on public.ai_analysis
    for each row execute procedure public.set_updated_at();
  end if;
end $$;

-- Reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  report_type report_type_enum not null,
  content text,
  sent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.reports enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reports' and policyname='reports_select_own') then
    create policy reports_select_own on public.reports for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reports' and policyname='reports_insert_own') then
    create policy reports_insert_own on public.reports for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reports' and policyname='reports_update_own') then
    create policy reports_update_own on public.reports for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reports' and policyname='reports_delete_own') then
    create policy reports_delete_own on public.reports for delete using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists idx_reports_user_sent_at on public.reports (user_id, sent_at desc);
create index if not exists idx_reports_user_type on public.reports (user_id, report_type);

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'reports_set_updated_at') then
    create trigger reports_set_updated_at before update on public.reports
    for each row execute procedure public.set_updated_at();
  end if;
end $$;

-- User sync: mirror auth.users → public.users (idempotent)
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', null))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_auth_user();
  end if;
end $$;


