# Discussion forum: moderation + media safety

The per-topic discussion forum (`discussion_posts` / `discussion_media` /
`discussion_reports`, migration `supabase/migrations/20260606090000_discussion_forum.sql`)
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
  row flips `is_hidden = true`, the storage read policy stops serving the object,
  because it joins to a visible row. Hiding is reversible.
- **Rate limits.** 15 posts/hour and 20 media/hour per account.
- **Banned terms.** Post body and display name run through the shared
  `text_has_banned_term()` matcher on insert and on edit.

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
4. **No orphan-object GC.** If a storage upload succeeds but the `discussion_media`
   insert fails, the client removes the object; a scheduled sweep is still worth
   adding as a backstop. An unreferenced object is unreadable anyway (the read
   policy requires a visible row).
5. **No EXIF / geolocation scrub** on uploaded images.
6. **Medical-claim detection is by form, not by filter.** The banned-term filter
   catches words, not a medical *claim*; the standing safety note and the lack of
   any medical field are what hold that line.
