-- Field-note filing has failed for EVERY non-admin role (42501) since the
-- EXECUTE revocations: trg_field_note_biu runs as the calling role and calls
-- public.note_base_rank(), which client roles may not execute. Result: zero
-- field notes have ever landed in production, while write-intent kept minting
-- anonymous accounts that could not file (68 minted, 0 notes). Caught by the
-- iOS 1.1.0 release gate probing the anonymous insert path directly.
--
-- Fix: bring the two functions that missed the house trigger pattern into it —
-- SECURITY DEFINER, pinned search_path, EXECUTE revoked from client roles.
-- Discussion triggers already follow this pattern and posting there works.

alter function public.on_field_note_biu()
  security definer
  set search_path = public, pg_temp;
revoke execute on function public.on_field_note_biu() from public, anon, authenticated;

alter function public.note_base_rank(text, boolean, integer, integer, integer)
  security definer
  set search_path = public, pg_temp;
revoke execute on function public.note_base_rank(text, boolean, integer, integer, integer) from public, anon, authenticated;
