-- Harden per security advisor: pin search_path (0011) and pull internal/trigger
-- functions off the public RPC surface (0028/0029). Triggers still fire after
-- revoke — Postgres does not check EXECUTE when firing a trigger.

alter function public.set_updated_at() set search_path = public;
alter function public.note_base_rank(text, boolean, int, int, int) set search_path = public;
alter function public.on_field_note_biu() set search_path = public;

revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.handle_user_claim() from anon, authenticated, public;
revoke execute on function public.on_engagement_change() from anon, authenticated, public;
revoke execute on function public.on_field_note_after() from anon, authenticated, public;
revoke execute on function public.on_field_note_biu() from anon, authenticated, public;
revoke execute on function public.set_updated_at() from anon, authenticated, public;
revoke execute on function public.refresh_author_rollup(uuid) from anon, authenticated, public;
-- is_admin() intentionally stays executable: RLS policies invoke it as the querying role.
-- note_base_rank() intentionally stays executable: the before-insert trigger (invoker) calls it.
