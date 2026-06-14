-- Performance: wrap bare auth.uid()/auth.jwt() calls in RLS policies as
-- (SELECT auth.x()) so Postgres evaluates them once per query (initplan)
-- instead of once per row. Semantically identical; only the expression text
-- changes via ALTER POLICY (roles/cmd/permissive are preserved). Already-
-- optimized "( SELECT auth.uid() AS uid)" forms are left untouched by the guard
-- (qual !~ 'SELECT auth.uid()'); bare auth.jwt() is wrapped everywhere.
-- Atomic: any malformed ALTER rolls the whole block back.
do $$
declare r record;
begin
  for r in
    with pol as (
      select schemaname, tablename, policyname, qual, with_check,
        case when qual is not null then
          regexp_replace(
            case when qual ~ 'auth\.uid\(\)' and qual !~ 'SELECT auth\.uid\(\)'
                 then replace(qual, 'auth.uid()', '(SELECT auth.uid())') else qual end,
            'auth\.jwt\(\)', '(SELECT auth.jwt())', 'g') end as new_qual,
        case when with_check is not null then
          regexp_replace(
            case when with_check ~ 'auth\.uid\(\)' and with_check !~ 'SELECT auth\.uid\(\)'
                 then replace(with_check, 'auth.uid()', '(SELECT auth.uid())') else with_check end,
            'auth\.jwt\(\)', '(SELECT auth.jwt())', 'g') end as new_with_check
      from pg_policies
      where schemaname='public'
        and ( (qual ~ 'auth\.uid\(\)' and qual !~ 'SELECT auth\.uid\(\)')
           or (with_check ~ 'auth\.uid\(\)' and with_check !~ 'SELECT auth\.uid\(\)')
           or qual ~ 'auth\.jwt\(\)' or with_check ~ 'auth\.jwt\(\)' )
    )
    select format('ALTER POLICY %I ON public.%I%s%s', policyname, tablename,
        case when new_qual is not null then ' USING ('||new_qual||')' else '' end,
        case when new_with_check is not null then ' WITH CHECK ('||new_with_check||')' else '' end) as stmt
    from pol
  loop
    execute r.stmt;
  end loop;
end $$;
