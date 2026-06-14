# Security

Report security issues privately to the repository owner.

Do not open a public issue for secrets, account access, Cloudflare tokens, GitHub tokens, or vulnerabilities that could expose user data.

## Current data posture

Pitch Atlas is no longer a static-only prototype. The web app includes a Supabase-backed community layer: anonymous or claimed accounts, field notes, per-topic discussion, own-rights media uploads, reports, blocks, and account deletion. Pitch content is still static and source-backed; the app does not call external pitch-data APIs at runtime.

The publishable Supabase key ships in the client by design. Row-level security, storage policies, JWT-verified Edge Functions, and private-schema admin helpers are the boundary. Do not move service-role keys, Cloudflare tokens, GitHub tokens, or account secrets into client code.

Community media uses the `discussion-media` bucket. Uploads must stay behind the own-the-rights terms gate, magic-byte validation, size caps, storage-path ownership checks, and report-driven hide/takedown behavior documented in `docs/community-media-moderation.md`.

Account deletion is handled by the Supabase Edge Function `delete-account`, with `verify_jwt = true` in `supabase/config.toml`. The function must only delete the caller's own account data, never accept a user id from the request body.

If implementation adds new data collection, auth surfaces, uploads, analytics, payments, or third-party services, update this file before shipping.
