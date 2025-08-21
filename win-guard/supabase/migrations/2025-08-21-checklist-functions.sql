-- Example RPC for monthly average checklist score
create or replace function public.checklist_monthly_scores(p_user uuid)
returns table(month text, avg_score numeric)
language sql
security definer
as $$
  select to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
         round(avg(score), 2) as avg_score
  from public.checklist_responses
  where user_id = p_user
  group by 1
  order by 1;
$$;


