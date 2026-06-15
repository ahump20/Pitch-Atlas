-- Sessionless visitors can read public field notes without minting an account,
-- but reaction toggles always sign in before inserting or deleting viewer rows.
-- Keep deletes available to signed-in contributors only.

revoke delete on public.note_tries from anon;
revoke delete on public.note_helpful from anon;

grant delete on public.note_tries to authenticated;
grant delete on public.note_helpful to authenticated;

comment on table public.note_tries is
  'One row per account that tried a field note. Signed-in contributors can add and remove their own mark; sessionless visitors hold no direct delete grant.';
comment on table public.note_helpful is
  'One row per account that marked a field note helpful. Signed-in contributors can add and remove their own mark; sessionless visitors hold no direct delete grant.';
