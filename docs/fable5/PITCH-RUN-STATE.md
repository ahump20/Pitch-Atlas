# Fable 5 Pitch Atlas Run State

Run started: 2026-06-09 (America/Chicago)
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
- [ ] Phase 1 route/live audit
- [ ] Phase 2 Supabase
- [ ] Phase 3 Stripe reality
- [ ] Phase 4 iOS authority + sync
- [ ] Phase 5 frontend design
- [ ] Phase 6 PWA/offline
- [ ] Phase 7 Cloudflare health
- [ ] Phase 8 tests + fresh verify + handoff

## Resumption notes

- Evidence: docs/fable5/PITCH-EVIDENCE-LEDGER.jsonl (one JSON object per line)
- Decisions: docs/fable5/PITCH-DECISIONS.md
- Main audit: docs/FABLE5-PITCH-ATLAS-AUDIT.md
- Route map: docs/route-map.pitch-atlas.json
- iOS sync: docs/PITCH-ATLAS-IOS-SYNC.md
- Codex desktop app is running on this machine; re-check `git status` before any push.
