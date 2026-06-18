-- Pin the remaining service-only helper functions off the mutable public schema.
-- These are not SECURITY DEFINER functions, but keeping an empty search_path
-- makes their runtime resolution explicit and quiets Supabase mutable-path drift.

alter function public.note_base_rank(text, boolean, integer, integer, integer)
  set search_path = '';

alter function public.on_field_note_biu()
  set search_path = '';

alter function public.set_updated_at()
  set search_path = '';

grant execute on function public.note_base_rank(text, boolean, integer, integer, integer)
  to service_role;
grant execute on function public.on_field_note_biu()
  to service_role;
grant execute on function public.set_updated_at()
  to service_role;

revoke execute on function public.note_base_rank(text, boolean, integer, integer, integer)
  from public, anon, authenticated;
revoke execute on function public.on_field_note_biu()
  from public, anon, authenticated;
revoke execute on function public.set_updated_at()
  from public, anon, authenticated;
