# Community security release

These changes require a coordinated database, Edge Function and web release.
Use the reviewed task commit and the production project identified by
`src/lib/supabase.ts`. Do not push all pending migrations from an unrelated checkout.

1. Apply `20260929223000_discussion_security_primitives.sql`. This prepares the
   service-only validation RPCs and enforces upload admission, deletion and report
   protections. Existing published rows remain intact.
   Also apply `20260929223200_discussion_media_storage_read_boundary.sql`; it
   repairs Storage download/signing under the existing column grants while
   preserving hidden-content and mutual-block filtering.
2. Deploy `validate-discussion-media` with its `deno.json`, lockfile, handler and
   shared signature module. Verify unauthenticated requests fail and a permanent
   test account can validate a newly uploaded object. An anonymous account must
   not download through the validator.
3. Deploy the updated web artifact through `deploy-cloudflare-pages.yml`. Validate
   uploads with the returned byte-derived metadata. Native/upload-first clients
   need the same invocation before finalization; reservations remain optional.
4. Apply `20260929223100_verified_discussion_media.sql` to require attestations.
   Older upload clients must update before attaching new media. Existing visible
   media is not retroactively validated or removed by these migrations.
5. Check live function/migration versions, service-only RPC grants, a successful
   upload, rejection of unattested metadata, and built service-worker activation.
   Preserve the distinction between local fixture proof and live acceptance.

Local checks:

```sh
npm run typecheck
npm run lint
npm run test
npm run build
# Disposable loopback database only; this command resets its schemas:
PITCH_ATLAS_TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/pitch_atlas_security_ci npm run test:security:postgres
npm run preview -- --host 127.0.0.1
npm run test:security:cache -- http://127.0.0.1:4173
```

The database fixture executes the repository's real migration functions while
emulating the Supabase Auth and Storage schemas. It reproduces the old failures
before asserting fixed behavior, including overlapping report transactions.
Upload admission also emulates Storage's caller-role permission probe/rollback
followed by its service-role commit, retaining the verified object owner.
It also checks Storage reads with the real client column grants: visible uploads
remain readable, while hidden media, hidden parents and mutual blocks deny access.
It does not replace a live Storage API upload test. Server validation checks
leading signatures and size, rather than decoding or scanning the entire file.
Account creation remains outside these per-account quotas.
