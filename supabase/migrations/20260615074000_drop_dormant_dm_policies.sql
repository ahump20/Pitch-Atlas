-- The legacy direct-message tables are dormant and client grants are closed.
-- Remove their RLS policies too, so a future table grant cannot revive the old
-- message surface by accident. Fresh preview databases may not have the tables.
do $$
begin
  if to_regclass('public.threads') is not null then
    execute 'drop policy if exists threads_delete_creator on public.threads';
    execute 'drop policy if exists threads_insert_own on public.threads';
    execute 'drop policy if exists threads_select_participant on public.threads';
    execute 'drop policy if exists threads_update_creator on public.threads';
  end if;

  if to_regclass('public.thread_participants') is not null then
    execute 'drop policy if exists participants_delete_thread_member on public.thread_participants';
    execute 'drop policy if exists participants_insert_thread_member on public.thread_participants';
    execute 'drop policy if exists participants_select_thread_member on public.thread_participants';
  end if;

  if to_regclass('public.messages') is not null then
    execute 'drop policy if exists messages_delete_sender on public.messages';
    execute 'drop policy if exists messages_insert_sender_member on public.messages';
    execute 'drop policy if exists messages_select_thread_member on public.messages';
    execute 'drop policy if exists messages_update_sender on public.messages';
  end if;
end $$;
