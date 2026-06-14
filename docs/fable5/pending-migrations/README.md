# Pending Migrations

No pending SQL migrations remain in this audit bundle.

The three files that used to live here were promoted into real Supabase migrations
and verified live:

- `20260610162340_pitches_backfill_chapter_routes.sql`
- `20260610162418_default_privilege_hardening.sql`
- `20260610162459_dm_revoke_and_fk_indexes.sql`

Future pending SQL should live here only while it is genuinely waiting on approval
or platform access. Once applied, move it into `supabase/migrations/` with the
live version stamp.
