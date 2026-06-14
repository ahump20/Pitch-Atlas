-- banned_terms is a server-side moderation wordlist. RLS is enabled with no
-- policy (lint 0008), so it is already deny-all to anon/authenticated via the
-- API and only the service_role (which bypasses RLS) reads it for filtering.
-- Express that intent explicitly: admins may read it to audit the list; no one
-- else can. This satisfies the linter and documents the deny-by-default posture.
create policy banned_terms_admin_read
  on public.banned_terms
  for select
  to authenticated
  using (private.is_admin());
