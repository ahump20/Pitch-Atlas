# Fable 5 Pitch Atlas Run State

Run started: 2026-06-09 (America/Chicago)
Run closed: 2026-06-09 ~22:00 CT. Refreshed 2026-06-14 UTC / 2026-06-13 CDT:
the former open SQL/design/function rows are resolved in source and, where
applicable, live Supabase. Refreshed again 2026-06-14: Supabase branch
automation now reports `FUNCTIONS_DEPLOYED` with `ACTIVE_HEALTHY` preview status.
Work branch (web): `fable5/pitch-atlas-review-safe-sync` off `main` @ ccea952
Budget: 35 turns / 4 hours, then report blockers.

## Goal

Make pitch-atlas.com and the Pitch Atlas iOS app feel like one sourced pitching
field manual: clean routes, clean Supabase community/auth, App Store-safe account
controls, synced content contracts, stronger frontend design, grip-first voice,
no fake pitch data / metrics / freshness / community activity.

## Worktree inventory (verified at run start)

| Tree | Branch | State | Call |
|---|---|---|---|
| ~/Pitch-Atlas | fable5/pitch-atlas-review-safe-sync (off main ccea952, in sync w/ origin) | clean + untracked nested repo `pitch-atlas-softball/` | primary web tree |
| ~/Pitch-Atlas/pitch-atlas-softball | feat/softball-fastpitch (own .git, same origin) | nested full clone, 41MB, build residue from softball launch | DO NOT TOUCH; preserved |
| ~/Pitch-Atlas-iOS | codex/blaze-companion-polish-ios (clean, in sync w/ origin) | clean; also has codex/supabase-v1-app-store branch | presumed authoritative — pending Phase 4 proof |
| ~/code/Pitch-Atlas-iOS | codex/blaze-companion-ios @ a26c068 | DIRTY: ~28 modified + untracked BlazeCompanion.swift | older draft; preserved untouched until diff reconciliation proves superseded |

## Phase status

- [x] Skills installed (pitch-junky, wabi-sabi, authentic-voice-editor-style) + reviewer agents dispatched
- [x] State preserved, work branch created
- [x] Run-state files created
- [x] Phase 1 route/live audit — routes reconciled, 104-URL sitemap, real 404, /privacy + /support shipped + verified live
- [x] Phase 2 Supabase — repo/live migration mirror refreshed through `20260614045210`; no pending SQL bundle remains
- [x] Phase 3 Stripe reality — orphaned live engine classified; teardown = Austin's destructive call
- [x] Phase 4 iOS authority + sync — A authoritative, B salvaged (PR #2), PLATFORM-CONTRACT.md
- [x] Phase 5 frontend design — specimen-card chip unclip + softball marker fixed + verified live
- [x] Phase 6 PWA/offline — honest offline proven in-browser; sw.js no-store fix live (zone Browser Cache TTL root cause)
- [x] Phase 7 Cloudflare health — deploys pinned --branch=main; headers/redirects verified; zone-TTL fix parked for Austin
- [x] Phase 8 tests + fresh verify + handoff — 326/326 vitest, tsc clean, live checks green; final report delivered in-session
- [x] Items 7+8 — docs/MEDIA-LEDGER.md (13 + 14-clip addendum, embed/link only) + docs/PLATFORM-CONTRACT.md

## Resumption notes

- Evidence: docs/fable5/PITCH-EVIDENCE-LEDGER.jsonl (one JSON object per line)
- Decisions: docs/fable5/PITCH-DECISIONS.md
- Main audit: docs/FABLE5-PITCH-ATLAS-AUDIT.md
- Route map: docs/route-map.pitch-atlas.json
- iOS sync: docs/PITCH-ATLAS-IOS-SYNC.md
- Codex desktop app is running on this machine; re-check `git status` before any push.
