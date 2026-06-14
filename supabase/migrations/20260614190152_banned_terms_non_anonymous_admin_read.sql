-- Keep banned_terms invisible to public clients while allowing claimed admins
-- to audit it. Anonymous Supabase sessions use the authenticated database role,
-- so the policy must exclude those JWTs explicitly.
drop policy if exists banned_terms_admin_read on public.banned_terms;

create policy banned_terms_admin_read
  on public.banned_terms
  for select
  to authenticated
  using (
    private.is_admin()
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
