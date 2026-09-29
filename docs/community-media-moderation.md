# Discussion forum: moderation + media safety

The per-topic discussion forum (`discussion_posts` / `discussion_media` /
`discussion_reports`, migration `supabase/migrations/20260606005149_discussion_forum.sql`)
allows native image and video uploads. This is the operational runbook for keeping
it safe, and the honest list of what is deferred.

## The automatic floor (no human in the loop for the dangerous case)

- **Own-folder writes.** Storage RLS pins every upload under `{auth.uid()}/...`; the
  publishable key cannot write into another account's folder.
- **Type + size.** After upload, `validate-discussion-media` verifies the caller,
  downloads the private object's actual bytes, checks its leading signature and
  actual size (8 MB image / 50 MB video), and records a service-only attestation.
  Finalization requires that attestation to match the current object UUID, owner,
  path, size, MIME and kind. SVG is excluded. This is signature validation, not a
  full decoder, malware scanner or content moderation service.
- **Terms gate.** Both raw Storage admission and media finalization require a
  permanent account with a row in `discussion_media_terms` (own-the-rights / no
  copyrighted footage / no minors / community standards).
- **Report → auto-hide.** A post hides at **3** distinct reporters; a media item at
  **2** (media is the higher-exposure surface). The instant a `discussion_media`
  row flips `is_hidden = true`, the storage read policy stops issuing new signed
  URLs because it joins to a visible row. A URL issued before the hide can remain
  valid for its one-hour TTL, then expires. Hiding is reversible.
- **Rate limits.** 15 posts/hour, 20 accepted Storage uploads/hour and at most 20
  active reservations per account. A private admission ledger survives object
  deletion and reservation release. Validation permits 40 attempts/hour per account.
- **Reply deletion.** Deleting a parent or its author's account detaches replies
  from other contributors instead of deleting them. They retain their media and
  topic, and remain hidden if the deleted parent was hidden. Same-author replies
  still cascade with their parent.
- **Private reads.** Supabase requests require the network. Service-worker
  activation deletes the previous `pa-supabase-reads` cache; static atlas pages and
  assets retain offline support. Changing accounts cannot replay a cached private
  response, and moderation reads stay current when online.
- **Banned terms.** Post body and display name run through the shared
  `text_has_banned_term()` matcher on insert and on edit.
- **EXIF / GPS scrub.** Still images (JPEG/PNG/WebP) are re-encoded through a
  canvas in the client before upload when decoding/encoding succeeds. This is a
  best-effort privacy measure: failures retain the original file
  (`src/lib/discussion.ts` `scrubImageMetadata`).
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

  Upload-first clients may omit the reservation RPC, but must invoke
  `validate-discussion-media` with `{ storagePath }` before inserting metadata,
  using the returned `byteSize`, `mimeType` and `kind`. Their media row must
  finalize within 23 hours of Storage object creation. Older web/native clients
  without validation cannot attach new media after enforcement; they must update.
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
4. **No guaranteed metadata scrub.** Still-image EXIF/GPS removal is best-effort
   in the browser; video container metadata is not scrubbed.
5. **Medical-claim detection is by form, not by filter.** The banned-term filter
   catches words, not a medical *claim*; the standing safety note and the lack of
   any medical field are what hold that line.
