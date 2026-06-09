# Pitch Atlas iOS Sync — 2026-06-09

Status: in progress; the iOS Authority Auditor's diff proof and contract checks land here.

## Verified so far

- Authority candidates: `~/Pitch-Atlas-iOS` (clean, codex/blaze-companion-polish-ios, in sync with origin) vs `~/code/Pitch-Atlas-iOS` (dirty at ancestor a26c068). Preliminary call: clean tree is authoritative; dirty tree appears to be an earlier draft of committed work d980d17 — pending file-by-file proof.
- iOS PR #1 "wire Supabase community for review" MERGED to main 2026-06-09; polish branch sits on top with companion motion + Apple sign-in entitlement.
- Build/test gate: `./scripts/build.sh test` → TEST SUCCEEDED, 18/18, including `testSupabaseConfigUsesPitchAtlasProject` (project ref pinned to cloeoulvrrfcbitrjpso) and `testPrivacyManifestDeclaresCommunityDataWithoutTracking`.
- Backend contracts the app depends on (blocks, reports, delete-account) live in web PR #16; see decision D4 for merge conditions.

## Pending

- Authority diff proof (auditor).
- Contract sync table: content JSON schema vs web data shapes; deep links vs web routes; auth callback URLs.
- App Store safety posture summary (Sign in with Apple, delete-account reachability in UI, UGC moderation copy).
- TestFlight/archive status: not attempted this run; signing and App Store Connect remain Austin-owned steps.
