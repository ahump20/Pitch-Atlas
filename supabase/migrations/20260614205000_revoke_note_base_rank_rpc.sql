-- Close the last direct client RPC grant on the field-note ranking helper.
--
-- note_base_rank() is used by database triggers and views to write/read the
-- stored rank. The web client reads base_rank; it does not need to execute the
-- helper itself.

revoke execute on function public.note_base_rank(text, boolean, int, int, int)
  from public, anon, authenticated;

comment on function public.note_base_rank(text, boolean, int, int, int) is
  'Internal field-note ranking helper. Triggers maintain base_rank; client roles read the stored value and cannot execute this directly.';
