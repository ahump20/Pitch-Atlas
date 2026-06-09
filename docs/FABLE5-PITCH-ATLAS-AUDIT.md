# Fable 5 Pitch Atlas Audit — 2026-06-09

Run: `fable5/pitch-atlas-review-safe-sync` · Evidence: `docs/fable5/PITCH-EVIDENCE-LEDGER.jsonl` · Decisions: `docs/fable5/PITCH-DECISIONS.md` · Screens: `docs/fable5/screens/`

Status legend: **verified** (tool-checked this run) · **reasoned** (inferred, not directly checked) · **blocked** (needs credentials/approval/platform state).

## 1. Health snapshot (verified)

| Area | State |
|---|---|
| Web baseline | typecheck clean; vitest 313/313 (19 files) |
| iOS baseline | PitchAtlas scheme builds; 18/18 tests pass (simulator), incl. privacy-manifest, Supabase-ref-pinned, provenance-contract tests |
| Live hydration | /, /repertoire (mobile), /pitch/four-seam, /softball, /about, /grips all hydrate with real sourced content (6 screenshots) |
| Community honesty | Field Notes copy: unvetted-publish + report-to-hide disclosed; empty state refuses fake counts ("no count is shown until it is real") |
| PWA | sw.js precaches zero HTML; NetworkFirst navigations; GET-only Supabase cache; no write caching |
| BSI boundary | No BSI branding seen above the fold on sampled surfaces; full sweep delegated to content auditor |

## 2. Worktree authority (verified)

- Web: `~/Pitch-Atlas` clean on main (ccea952), work branch created. Nested **untracked** repo `pitch-atlas-softball/` (41MB, branch feat/softball-fastpitch) preserved untouched — disposal is Austin's call (decision D1).
- iOS: `~/Pitch-Atlas-iOS` clean, branch `codex/blaze-companion-polish-ios`, in sync with origin — **presumed authoritative**; `~/code/Pitch-Atlas-iOS` dirty at ancestor a26c068 — preserved untouched pending the auditor's file-by-file diff proof (decision D3).

## 3. Route reconciliation (partial — cartographer fills the table)

Verified this run:
- Real routes 308-redirect to trailing-slash form and 200.
- `/pitch-index`, `/classify` → 301 → `/repertoire/`; `/kinetic-chain` → 301 → `/learn/mechanics/`. The two-index-views fork is resolved live: `/repertoire` is the single front door (rows/cards toggle).
- Soft-404: ALL unknown paths (incl. `/community`, `/auth`, `/login`, `/account`) return 200 with the home document. No standalone community/auth routes exist; Discussion + Field Notes are embedded `#discussion` / `#field-notes` sections on specimen/repertoire pages.
- Full router × ssg-paths × sitemap × live matrix: `docs/route-map.pitch-atlas.json` (pending workflow output).

## 4. Supabase (project cloeoulvrrfcbitrjpso) — pending auditor + PR #16 review (verified so far)

- Repo main carries 5 community migrations (safety floor, discussion forum, access fix, anon grants, is_admin execute grant) with banned-terms/rate-limit references.
- **PR #16** (Codex) = account-safety backend already applied live: blocked_users + RLS, private-schema helpers, block-edge trigger, narrowed grants, JWT-verified delete-account Edge Function. Review verdict + merge conditions in decision D4. Known defects: stray gitlink of pitch-atlas-softball; field_notes UPDATE policy without matching grant; delete-account FK-cascade assumption unproven.
- Advisor before/after table: pending auditor.

## 5. Stripe reality — pending auditor

## 6. iOS sync — pending auditor

- iOS PR #1 (Supabase community wiring) MERGED to main 2026-06-09. Polish branch adds Blaze-companion motion + Apple sign-in entitlement on top, tests green.

## 7. PWA/offline (verified, one residual)

Design is honest (see §1). Residual: in-browser offline toggle proof — blocked while the headless Chrome is held by an auditor; to be run before close.

## 8. Open issue list (running)

| # | Sev | Area | Issue | Status |
|---|---|---|---|---|
| 1 | med | routes | Soft-404: unknown paths return 200 + home doc; no 404.html / not-found view proof | open |
| 2 | med | supabase | PR #16 gitlink defect blocks merge | open (fix at merge) |
| 3 | low | supabase | field_notes UPDATE policy dead (no grant) | open (decide) |
| 4 | med | supabase | delete-account cascade assumption (posts/notes/profiles) unverified | open |
| 5 | low | design | Hero specimen card: clipped chip artifact top-left | open |
| 6 | low | design | Softball "S START HERE" stray drop-cap | open |
| 7 | low | repo | Stale untracked dist/ in repo root | note only |
| 8 | med | supabase | Supabase GitHub branch automation reports MIGRATIONS_FAILED (per PR #16 body) | blocked/confirm |
