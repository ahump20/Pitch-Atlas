# Discussion forum: moderation + media safety

The per-topic discussion forum (`discussion_posts` / `discussion_media` /
`discussion_reports`, migration `supabase/migrations/20260606005149_discussion_forum.sql`)
allows native image and video uploads. This is the operational runbook for keeping
it safe, and the honest list of what is deferred.

## The automatic floor (no human in the loop for the dangerous case)

- **Own-folder writes.** Storage RLS pins every upload under `{auth.uid()}/...`; the
  publishable key cannot write into another account's folder.
- **Type + size.** The bucket allowlist, the client magic-byte sniff, and the
  `enforce_discussion_media_limits()` trigger each reject anything that is not an
  allowed image/video, or is over 8 MB (image) / 50 MB (video). SVG is excluded
  deliberately (script-in-image XSS vector).
- **Terms gate.** No media inserts until the account has a `media_terms_accepted_at`
  timestamp (own-the-rights / no copyrighted footage / no minors / community
  standards). Enforced in the trigger, so a crafted client cannot bypass it.
- **Report → auto-hide.** A post hides at **3** distinct reporters; a media item at
  **2** (media is the higher-exposure surface). The instant a `discussion_media`
  row flips `is_hidden = true`, the storage read policy stops issuing new signed
  URLs because it joins to a visible row. A URL issued before the hide can remain
  valid for its one-hour TTL, then expires. Hiding is reversible.
- **Rate limits.** 15 posts/hour and 20 media/hour per account.
- **Banned terms.** Post body and display name run through the shared
  `text_has_banned_term()` matcher on insert and on edit.
- **EXIF / GPS scrub.** Still images (JPEG/PNG/WebP) are re-encoded through a
  canvas in the client before upload, so camera and location metadata is dropped
  before any bytes leave the device (`src/lib/discussion.ts` `scrubImageMetadata`).
  GIF passes through (it carries no EXIF, and a re-encode would flatten the
  animation); video container metadata is still out of scope (see deferred).
- **Orphan-object sweep.** An hourly cron calls the service-only
  `gc-orphan-discussion-media` Edge Function (migration `20260717032343`). Postgres
  lists at most 1,000 `discussion-media` objects older than 24 hours that have no
  database row and no active upload reservation; the function removes them through
  the Storage API. It also prunes expired reservations. Hidden media is still backed
  by a row, so moderation remains reversible. This is the backstop for a client that
  dies between the storage upload and the row insert.

  Web uploads reserve a new own-folder path before sending bytes. A successful
  `discussion_media` insert consumes that reservation in the same transaction. The
  reservation lasts 25 hours. Finalization locks the matching reservation row through
  the insert commit. If the hourly sweep tries to expire that reservation at the same
  time, its delete waits; its following orphan query then sees the committed media row
  and leaves the object alone. The reservation does not grant Storage read access:
  until a visible media row exists, the bytes stay private and cannot receive a signed
  URL. A claimed account can hold at most 20 active reservations, and cannot reserve a
  path after a Storage object already exists. A concrete failed write releases its
  reservation; the browser never deletes rowless bytes. Network, status-0, and 5xx
  outcomes retain the reservation because the database write may still be committing.
  The hourly sweep removes any bytes left behind after the age and reservation gates
  clear.

  Legacy and iOS clients can keep their upload-first order without the reservation
  RPC. Their media row must finalize within 23 hours of Storage object creation.
  Garbage collection does not consider the object until 24 hours, leaving a full
  hour in which unreserved late finalization is closed before deletion can start.
  Production must seed the environment-specific `pitch_atlas_project_url` Vault
  value before applying the migration. The migration creates a random 256-bit
  `pitch_atlas_automations_shared_secret` in Vault only when one does not exist.
  Environments without the project URL apply the schema but do not schedule the
  job, so preview branches cannot call production.

  Cron sends the raw shared secret only in the `X-Pitch-Atlas-Automation` request
  header. The Edge Function hashes it with Web Crypto and sends only that SHA-256
  digest through the anon PostgREST client to
  `authorize_discussion_media_gc(text)`. The tightly granted security-definer RPC
  compares it with the digest of the decrypted Vault value. Only a match allows the
  function to construct its service-role client and list or remove orphaned objects.
  The raw secret never enters PostgREST, and this path does not depend on a named
  Supabase API key.

  The function records every authenticated run in
  `private.discussion_media_gc_runs`. In the SQL editor, inspect the last day with:

  ```sql
  select ran_at, status, requested, removed, error_code
  from private.discussion_media_gc_runs
  where ran_at > now() - interval '24 hours'
  order by ran_at desc;
  ```

  No successful row for more than two hours means the shared-secret header, hash
  gate, Vault URL, cron job, or queued HTTP response needs inspection. HTTP status
  and timeout details live in `net._http_response`.

## Admin review (service role / Supabase dashboard)

There is no in-app moderator UI in v1. Review with the service role (Supabase SQL
editor or MCP `execute_sql`). An admin is any `profiles.is_admin = true` account.

```sql
-- Queue: media hidden by reports, newest first
select m.id, m.topic_key, m.kind, m.report_count, m.created_at, m.storage_path
from public.discussion_media m
where m.is_hidden = true
order by m.created_at desc;

-- Queue: posts hidden by reports
select p.id, p.topic_key, p.display_name, left(p.body, 120) as body, p.report_count
from public.discussion_posts p
where p.is_hidden = true
order by p.created_at desc;

-- Restore (false report): clear the flag
update public.discussion_media set is_hidden = false where id = '<media_id>';
update public.discussion_posts  set is_hidden = false where id = '<post_id>';

-- Takedown (real violation): delete the row AND the storage object
delete from public.discussion_media where id = '<media_id>';
-- then remove the object from the 'discussion-media' bucket at <storage_path>
```

Deleting a `discussion_post` cascades to its replies, its media rows, and its
reports. Deleting the storage object is a separate step (the row delete does not
remove bytes); do both for a hard takedown.

## Deferred — known limitations (flag these before scaling the surface)

1. **No automated content scanning.** No nudity/CSAM/violence classifier, no
   PhotoDNA hash-matching. Detection is community-report-driven only. This is the
   single largest residual exposure for native video.
2. **No bot protection (Turnstile).** Anonymous accounts are cheap, so the rate
   limits are priced in accounts, not humans. Turnstile is the next hardening step.
3. **No in-app moderator role/UI.** Review is service-role / dashboard only.
4. **No video container-metadata scrub.** Still-image EXIF/GPS is stripped on
   upload (see the automatic floor); video container metadata is not yet scrubbed.
5. **Medical-claim detection is by form, not by filter.** The banned-term filter
   catches words, not a medical *claim*; the standing safety note and the lack of
   any medical field are what hold that line.
