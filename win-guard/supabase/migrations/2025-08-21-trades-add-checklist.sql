-- Add checklist_score to trades for quick filtering/analytics
alter table public.trades add column if not exists checklist_score numeric;
create index if not exists trades_checklist_score_idx on public.trades (checklist_score);


