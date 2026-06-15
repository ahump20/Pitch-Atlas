-- Keep media terms out of direct client table grants. The browser gets
-- narrowly-scoped RPCs; the table stays private to the database owner.

revoke select, insert on public.discussion_media_terms from anon, authenticated;

create or replace function public.has_accepted_media_terms()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null then false
    when coalesce(((auth.jwt() ->> 'is_anonymous')::boolean), true) then false
    else exists (
      select 1
      from public.discussion_media_terms
      where user_id = auth.uid()
    )
  end;
$$;

create or replace function public.accept_media_terms()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  viewer_id uuid := auth.uid();
begin
  if viewer_id is null or coalesce(((auth.jwt() ->> 'is_anonymous')::boolean), true) then
    raise exception 'Permanent account required'
      using errcode = '42501';
  end if;

  insert into public.discussion_media_terms (user_id)
  values (viewer_id)
  on conflict (user_id) do nothing;
end;
$$;

revoke all on function public.has_accepted_media_terms() from public;
revoke all on function public.accept_media_terms() from public;
grant execute on function public.has_accepted_media_terms() to authenticated;
grant execute on function public.accept_media_terms() to authenticated;

comment on function public.has_accepted_media_terms() is
  'Returns whether the current permanent signed-in account accepted media upload terms.';
comment on function public.accept_media_terms() is
  'Idempotently records media upload terms acceptance for the current permanent signed-in account.';
