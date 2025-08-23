-- AI Analysis table
create table if not exists public.ai_analysis (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references public.trades(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  discipline_score int not null check (discipline_score >= 0 and discipline_score <= 100),
  emotional_state text,
  mistakes_detected text,
  suggestions text,
  created_at timestamp with time zone default now()
);

create index if not exists ai_analysis_user_idx on public.ai_analysis(user_id);
create index if not exists ai_analysis_trade_idx on public.ai_analysis(trade_id);
create index if not exists ai_analysis_created_idx on public.ai_analysis(created_at);

-- RLS
alter table public.ai_analysis enable row level security;

create policy if not exists "AI analysis viewable by owner" on public.ai_analysis
  for select using (auth.uid() = user_id);

create policy if not exists "AI analysis insertable by owner" on public.ai_analysis
  for insert with check (auth.uid() = user_id);

-- Optional: monthly stats RPC
create or replace function public.ai_analysis_monthly_stats(p_user uuid)
returns table(month text, avg_discipline numeric, count int)
language sql
security definer
as $$
  select to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
         round(avg(discipline_score), 2) as avg_discipline,
         count(*)::int as count
  from public.ai_analysis
  where user_id = p_user
  group by 1
  order by 1;
$$;



