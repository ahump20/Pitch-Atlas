-- Pitch Atlas uses Supabase REST, Storage, and Edge Functions, not the
-- generated GraphQL endpoint. Keep public community read grants unchanged;
-- remove pg_graphql so /graphql/v1 does not advertise the public schema.
drop extension if exists pg_graphql;
