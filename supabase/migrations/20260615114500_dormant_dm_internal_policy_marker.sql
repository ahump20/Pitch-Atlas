-- Supabase's security advisor treats authenticated-role policies as reachable
-- by anonymous sign-in sessions, even when the policy expressions are false.
-- Keep these dormant tables closed to browser clients by leaving client grants
-- revoked, and leave only an internal policy marker so RLS is not policy-empty.
do $$
begin
  if to_regclass('public.threads') is not null then
    execute 'drop policy if exists dormant_threads_client_deny on public.threads';
    execute 'drop policy if exists dormant_threads_internal_marker on public.threads';
    execute 'create policy dormant_threads_internal_marker on public.threads as restrictive for all to service_role using (false) with check (false)';
  end if;

  if to_regclass('public.thread_participants') is not null then
    execute 'drop policy if exists dormant_thread_participants_client_deny on public.thread_participants';
    execute 'drop policy if exists dormant_thread_participants_internal_marker on public.thread_participants';
    execute 'create policy dormant_thread_participants_internal_marker on public.thread_participants as restrictive for all to service_role using (false) with check (false)';
  end if;

  if to_regclass('public.messages') is not null then
    execute 'drop policy if exists dormant_messages_client_deny on public.messages';
    execute 'drop policy if exists dormant_messages_internal_marker on public.messages';
    execute 'create policy dormant_messages_internal_marker on public.messages as restrictive for all to service_role using (false) with check (false)';
  end if;
end $$;
