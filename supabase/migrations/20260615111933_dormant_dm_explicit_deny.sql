-- Keep the dormant direct-message tables closed to browser Supabase clients,
-- while making that closure explicit enough for database advisory checks.
-- These tables are still served only through admin/service code paths.
do $$
begin
  if to_regclass('public.threads') is not null then
    execute 'drop policy if exists dormant_threads_client_deny on public.threads';
    execute 'create policy dormant_threads_client_deny on public.threads as restrictive for all to authenticated using (false) with check (false)';
  end if;

  if to_regclass('public.thread_participants') is not null then
    execute 'drop policy if exists dormant_thread_participants_client_deny on public.thread_participants';
    execute 'create policy dormant_thread_participants_client_deny on public.thread_participants as restrictive for all to authenticated using (false) with check (false)';
  end if;

  if to_regclass('public.messages') is not null then
    execute 'drop policy if exists dormant_messages_client_deny on public.messages';
    execute 'create policy dormant_messages_client_deny on public.messages as restrictive for all to authenticated using (false) with check (false)';
  end if;
end $$;
