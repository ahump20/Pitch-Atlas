-- Run client-callable account RPCs as the caller.
--
-- The table grants below expose only the columns each RPC reads or writes.
-- Row-level policies still restrict rows to the current non-anonymous account.

revoke select on public.note_tries from anon, authenticated;
grant select (
  note_id,
  user_id
) on public.note_tries to authenticated;

revoke select on public.note_helpful from anon, authenticated;
grant select (
  note_id,
  user_id
) on public.note_helpful to authenticated;

revoke select, insert on public.discussion_media_terms from anon, authenticated;
grant select (
  user_id
) on public.discussion_media_terms to authenticated;
grant insert (
  user_id
) on public.discussion_media_terms to authenticated;

create or replace function public.has_accepted_media_terms()
returns boolean
language sql
security invoker
set search_path = ''
as $$
  with viewer as (
    select
      (select auth.uid()) as user_id,
      coalesce((((select auth.jwt()) ->> 'is_anonymous')::boolean), true) as is_anonymous
  )
  select case
    when viewer.user_id is null then false
    when viewer.is_anonymous then false
    else exists (
      select 1
      from public.discussion_media_terms
      where user_id = viewer.user_id
    )
  end
  from viewer;
$$;

create or replace function public.accept_media_terms()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  viewer_id uuid := (select auth.uid());
  viewer_is_anonymous boolean := coalesce((((select auth.jwt()) ->> 'is_anonymous')::boolean), true);
begin
  if viewer_id is null or viewer_is_anonymous then
    raise exception 'Permanent account required'
      using errcode = '42501';
  end if;

  insert into public.discussion_media_terms (user_id)
  values (viewer_id)
  on conflict (user_id) do nothing;
end;
$$;

create or replace function public.viewer_note_engagement()
returns table (
  note_id uuid,
  tried boolean,
  helpful boolean
)
language sql
stable
security invoker
set search_path = ''
as $$
  with viewer as (
    select (select auth.uid()) as user_id
  ),
  tried_notes as (
    select nt.note_id
    from public.note_tries nt
    join viewer v on nt.user_id = v.user_id
  ),
  helpful_notes as (
    select nh.note_id
    from public.note_helpful nh
    join viewer v on nh.user_id = v.user_id
  )
  select
    coalesce(t.note_id, h.note_id) as note_id,
    t.note_id is not null as tried,
    h.note_id is not null as helpful
  from tried_notes t
  full join helpful_notes h using (note_id)
  where (select user_id from viewer) is not null;
$$;

revoke all on function public.has_accepted_media_terms() from public;
revoke all on function public.accept_media_terms() from public;
revoke all on function public.viewer_note_engagement() from public;

grant execute on function public.has_accepted_media_terms() to authenticated;
grant execute on function public.accept_media_terms() to authenticated;
grant execute on function public.viewer_note_engagement() to authenticated;

comment on function public.has_accepted_media_terms() is
  'Returns whether the current permanent signed-in account accepted media upload terms. Runs as invoker through authenticated column grants and RLS.';
comment on function public.accept_media_terms() is
  'Idempotently records media upload terms acceptance for the current permanent signed-in account. Runs as invoker through authenticated column grants and RLS.';
comment on function public.viewer_note_engagement() is
  'Returns current-account Field Notes tried/helpful flags through authenticated column grants and RLS.';
