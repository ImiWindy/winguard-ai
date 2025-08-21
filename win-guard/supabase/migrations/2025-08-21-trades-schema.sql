-- Idempotent schema migration for trades table, policies, indexes, trigger
-- Requires pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;

-- Add table if not exists with desired columns
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  entry_price numeric not null,
  exit_price numeric not null,
  position_size numeric not null,
  feeling text check (feeling in ('Fear','Greed','Neutral')) default 'Neutral',
  side text check (side in ('long','short')) default 'long',
  notes text,
  screenshot_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure columns exist (for existing tables)
do $$ begin
  -- migrate id to uuid primary key if needed
  if exists (
    select 1 from information_schema.columns where table_schema='public' and table_name='trades' and column_name='id' and data_type <> 'uuid'
  ) then
    -- add temp uuid column
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='trades' and column_name='id_uuid') then
      alter table public.trades add column id_uuid uuid default gen_random_uuid();
      update public.trades set id_uuid = gen_random_uuid() where id_uuid is null;
    end if;
    -- drop existing primary key if present
    begin
      alter table public.trades drop constraint trades_pkey;
    exception when undefined_object then
      -- ignore if no constraint name matches
    end;
    -- drop old id and rename
    alter table public.trades drop column id;
    alter table public.trades rename column id_uuid to id;
    alter table public.trades add primary key (id);
  elsif not exists (select 1 from information_schema.columns where table_schema='public' and table_name='trades' and column_name='id') then
    alter table public.trades add column id uuid primary key default gen_random_uuid();
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='trades' and column_name='created_at') then
    alter table public.trades add column created_at timestamptz not null default now();
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='trades' and column_name='updated_at') then
    alter table public.trades add column updated_at timestamptz not null default now();
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='trades' and column_name='side') then
    alter table public.trades add column side text check (side in ('long','short')) default 'long';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='trades' and column_name='notes') then
    alter table public.trades add column notes text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='trades' and column_name='screenshot_url') then
    alter table public.trades add column screenshot_url text;
  end if;
end $$;

-- RLS
alter table public.trades enable row level security;

-- Policies
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='trades' and policyname='trades_select_own'
  ) then
    create policy "trades_select_own" on public.trades for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='trades' and policyname='trades_insert_own'
  ) then
    create policy "trades_insert_own" on public.trades for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='trades' and policyname='trades_update_own'
  ) then
    create policy "trades_update_own" on public.trades for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='trades' and policyname='trades_delete_own'
  ) then
    create policy "trades_delete_own" on public.trades for delete using (auth.uid() = user_id);
  end if;
end $$;

-- Indexes
create index if not exists idx_trades_user_created_at on public.trades (user_id, created_at desc);
create index if not exists idx_trades_user_symbol on public.trades (user_id, symbol);
create index if not exists idx_trades_user_feeling on public.trades (user_id, feeling);

-- Trigger to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$ begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trades_set_updated_at'
  ) then
    create trigger trades_set_updated_at
    before update on public.trades
    for each row
    execute procedure public.set_updated_at();
  end if;
end $$;

-- Storage bucket policies
-- Create bucket (noop if exists via RPC)
-- Note: requires supabase.storage API context; omit create here if managed separately

-- Policies for trade-screenshots bucket
-- Insert/Update/Delete only within own folder
create policy if not exists "upload_own_screenshots" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'trade-screenshots'
  and name like auth.uid()::text || '/%'
);

create policy if not exists "update_own_screenshots" on storage.objects
for update to authenticated
using (
  bucket_id = 'trade-screenshots' and name like auth.uid()::text || '/%'
)
with check (
  bucket_id = 'trade-screenshots' and name like auth.uid()::text || '/%'
);

create policy if not exists "delete_own_screenshots" on storage.objects
for delete to authenticated
using (
  bucket_id = 'trade-screenshots' and name like auth.uid()::text || '/%'
);

-- Public read
create policy if not exists "public_read_screenshots" on storage.objects
for select to public
using (bucket_id = 'trade-screenshots');


