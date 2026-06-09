# Pitch Atlas iOS Sync — 2026-06-09

Status: authority decided, salvage shipped, contracts synced. Remaining items are Austin-owned platform steps.

## Authority decision (adversarially verified)

**Authoritative tree: `~/Pitch-Atlas-iOS`** (was codex/blaze-companion-polish-ios @ d980d17; now carries the salvage branch). Proof: its committed build.sh is byte-provably a successor of the dirty tree's draft; its Companion feature (8 files + tests + image sets) supersedes the dirty tree's single-file draft; it is in sync with origin.

**`~/code/Pitch-Atlas-iOS` (dirty tree) was NOT discardable** — 19 of its 28 dirty files were the never-committed iOS no-fake-numbers content pass. That work is now salvaged:

- Branch `fable5/ios-qualitative-content-pass` (off the polish branch), pushed; **PR #2** open to main.
- `f89cf2a` — content pass: bundled pitches.json drops all 12 spinRateRpm + ivbInches claims for sourced qualitative shape language; ContentModels decodes numerics as tolerant optionals; SeamBall/detail views render shape words; CLAUDE.md corrected (native-only v1, no WKWebView island).
- `c9a3bb2` — App Store Connect pack rewritten to community-era reality (the salvaged pack claimed "no account, no network" — false since the community merge).
- Completeness proof: 19 files byte-identical to the dirty tree; 9 intentional merges/skips (authoritative companion code wins). The dirty tree is now fully represented and safe to delete on Austin's confirmation.

## Contract sync vs web/backend

| Contract | State |
|---|---|
| Physics language | SYNCED by PR #2 — words-only, matching web types.ts PhysicsReference |
| Supabase project + key | Pinned by test: cloeoulvrrfcbitrjpso, publishable key only, PKCE; iOS redirect `pitchatlas://auth-callback` |
| Specimen slugs | 12 filed specimens match web PITCHES exactly |
| Community (field notes, discussion, report, block) | Live RLS enforces block-edge filtering server-side (captured in web PR #16) |
| delete-account | Deployed, JWT-verified, caller-only; FK cascades cover posts/notes/profile; in-app UI flow present |
| Deep links | pitchatlas://tab, pitch, craftsman only, resolved against bundled data (fails safe); no universal links, and no AASA exists live — fine until universal links are wanted |
| /support + /privacy web URLs (linked from iOS Account screen) | Were soft-404s — real pages shipped in this run's web fix bundle |
| Softball wing | Web-only, consistent with locked v1 iOS scope |

## Build/test status

`./scripts/build.sh test` → TEST SUCCEEDED on the salvage HEAD (iPhone 17 Pro simulator); 18-test suite includes privacy-manifest-no-tracking, Supabase-ref-pinned, provenance-contract, community-image-rejection.

## App Store safety posture

Sign in with Apple (entitlement + UI), optional accounts, UGC with report/block + unvetted-publish disclosure, in-app account deletion, privacy manifest declaring community data without tracking, no IAP/Stripe surface, 17+/UGC posture documented in APP-REVIEW-NOTES.md. Privacy labels in App Store Connect must NOT say "Data Not Collected."

## Austin-owned remaining steps

1. Merge PR #2 (after web PR #16 merges, since the app's community contract leans on those live policies being source-controlled).
2. Signing, archive, TestFlight, App Store Connect submission — needs your Apple account; nothing here was verified against ASC.
3. Confirm deletion of `~/code/Pitch-Atlas-iOS` (salvage proven complete).
4. Supabase dashboard: confirm auth redirect allowlist contains `https://pitch-atlas.com/*` and `pitchatlas://auth-callback`; toggle leaked-password protection.
