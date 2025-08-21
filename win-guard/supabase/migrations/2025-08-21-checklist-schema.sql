-- Checklist Module Schema
-- Extensions
create extension if not exists pgcrypto;

-- Templates table: stores per-user checklist templates as JSONB with versions
create table if not exists public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  version int not null,
  title text default 'Default',
  items jsonb not null,
  is_active boolean not null default true,
  created_at timestamp with time zone default now()
);

create unique index if not exists checklist_templates_user_version_uq on public.checklist_templates(user_id, version);
create index if not exists checklist_templates_user_active_idx on public.checklist_templates(user_id) where is_active;

-- Responses table: one row per trade submission
create table if not exists public.checklist_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  trade_id uuid not null references public.trades (id) on delete cascade,
  template_version int not null,
  responses jsonb not null,
  score numeric not null check (score >= 0 and score <= 100),
  missing_critical_items jsonb default '[]'::jsonb,
  notes text,
  created_at timestamp with time zone default now()
);

create index if not exists checklist_responses_user_idx on public.checklist_responses(user_id);
create index if not exists checklist_responses_trade_idx on public.checklist_responses(trade_id);

-- RLS
alter table public.checklist_templates enable row level security;
alter table public.checklist_responses enable row level security;

-- Policies
create policy if not exists "Checklist templates are viewable by owner" on public.checklist_templates
  for select using (auth.uid() = user_id);
create policy if not exists "Checklist templates are insertable by owner" on public.checklist_templates
  for insert with check (auth.uid() = user_id);
create policy if not exists "Checklist templates are updatable by owner" on public.checklist_templates
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "Checklist responses are viewable by owner" on public.checklist_responses
  for select using (auth.uid() = user_id);
create policy if not exists "Checklist responses are insertable by owner" on public.checklist_responses
  for insert with check (auth.uid() = user_id);


