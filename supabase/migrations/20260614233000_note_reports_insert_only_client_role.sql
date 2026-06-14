-- note_reports is a write-only moderation queue for public clients.
-- Admin review should happen through trusted tooling or service-role code, not
-- by granting the public authenticated role update access to the queue.
revoke update on public.note_reports from anon, authenticated;

drop policy if exists reports_admin_update on public.note_reports;

comment on table public.note_reports is
  'Write-only report queue for normal clients. Public client roles can insert reports; trusted/admin tooling reviews and updates with elevated privileges.';
