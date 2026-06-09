-- banned_terms is read only by the SECURITY DEFINER trigger (as owner) and managed
-- out-of-band via SQL/service-role. It must never be reachable through PostgREST or
-- discoverable in the GraphQL schema, so revoke all role grants and drop the
-- API-facing policy. RLS stays enabled (default-deny) as defense in depth.
revoke all on public.banned_terms from anon, authenticated;
drop policy if exists banned_terms_admin_all on public.banned_terms;
