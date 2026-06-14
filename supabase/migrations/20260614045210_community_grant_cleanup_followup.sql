-- Close the low-risk community grant residue from the Fable 5 audit.
--
-- 1. Public profile reads still need the visible handle/score fields, but not
--    is_admin. Keep private.is_admin() as the RLS helper; hide the column from
--    anon/authenticated client selects.
-- 2. field_notes_update_own and tries_update_own existed as policies, but the
--    later App Store grant cleanup removed their matching UPDATE grants. Restore
--    only the editable columns.
-- 3. Report queues are reviewed through trusted tooling/service role, not public
--    clients. Drop the client-facing admin read policies instead of leaving dead
--    SELECT policies with no table grant.

revoke select on public.profiles from anon, authenticated;
grant select (id, display_name, is_claimed, contribution_score, notes_count)
  on public.profiles to anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

grant update (
  tweak,
  claimed_result_note,
  sample_size,
  evidence_url,
  evidence_label,
  source_tier,
  note
) on public.field_notes to authenticated;

grant update (outcome_kind) on public.note_tries to authenticated;

drop policy if exists reports_admin_read on public.note_reports;
drop policy if exists discussion_reports_admin_read on public.discussion_reports;

comment on table public.profiles is
  'Public contributor profile. Client roles can read handle/score fields only; is_admin stays server-side behind private.is_admin().';
comment on table public.note_reports is
  'Write-only report queue for normal clients. Trusted/admin tooling reviews it with elevated privileges.';
comment on table public.discussion_reports is
  'Write-only report queue for normal clients. Trusted/admin tooling reviews it with elevated privileges.';
