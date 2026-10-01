-- Viewer engagement read state is account-scoped. Keep the underlying rows out
-- of generated table APIs and expose only the two booleans the Field Notes UI
-- needs for the current session.

revoke select on public.note_tries from anon, authenticated;
revoke select on public.note_helpful from anon, authenticated;

create or replace function public.viewer_note_engagement()
returns table (
  note_id uuid,
  tried boolean,
  helpful boolean
)
language sql
stable
security definer
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

revoke all on function public.viewer_note_engagement() from public;
grant execute on function public.viewer_note_engagement() to authenticated;

comment on function public.viewer_note_engagement() is
  'Returns current-account Field Notes tried/helpful flags without granting direct SELECT on note_tries or note_helpful.';
