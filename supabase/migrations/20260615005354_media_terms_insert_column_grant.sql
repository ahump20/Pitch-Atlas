-- Upload terms acceptance is timestamped by the database. Clients identify the
-- accepting account; accepted_at remains database-owned through its default.

revoke insert on public.discussion_media_terms from anon, authenticated;
grant insert (user_id) on public.discussion_media_terms to authenticated;

comment on table public.discussion_media_terms is
  'One row per account that has accepted upload terms. Client roles insert user_id only; accepted_at stays database-owned.';
