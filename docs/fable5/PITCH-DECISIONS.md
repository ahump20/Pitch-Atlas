# Fable 5 Pitch Atlas Decisions

Each decision: what was decided, why, evidence, and reversal path.

## D1 — Nested softball repo preserved in place (2026-06-09)

`~/Pitch-Atlas/pitch-atlas-softball/` is a full nested clone (own .git, branch
`feat/softball-fastpitch`, same origin) left over from the softball-wing build
that already shipped to main. It is untracked by the parent repo and 41MB.
Decision: do not delete, do not add to git. Flag to Austin for disposal once he
confirms nothing in it is unmerged. Reversal: none needed (no action taken).

## D2 — Work branch strategy (2026-06-09)

All web edits land on `fable5/pitch-atlas-review-safe-sync` off main @ ccea952.
Deploys to production happen only from main after merge, via local wrangler with
`--branch=main` (per repo gotcha: omitting it creates a branch preview).

## D4 — PR #16 (iOS account safety preflight) review verdict (2026-06-09)

Codex's PR #16 captures into the repo the migrations already applied to the live
DB (ios_app_store_preflight + ios_app_store_grant_cleanup) plus the JWT-protected
delete-account Edge Function and supabase/config.toml. Review read: the RLS design
is sound (private-schema is_admin/blocked_between helpers, block-edge trigger,
narrowed grants, anonymous-session exclusion on block management and note edits).
Merging does not touch prod; it reconciles source with live.

Resolution refresh, 2026-06-14 UTC / 2026-06-13 CDT:
1. PR #16 is merged.
2. The live migration list includes the iOS preflight/grant cleanup and later
   repo-synced migrations through `20260614045210_community_grant_cleanup_followup`.
3. The dead owner-update grant is resolved by `20260614045210`: authenticated users
   have narrow update access for editable `field_notes` columns and
   `note_tries.outcome_kind`.
4. The delete-account cascade assumption was verified in the Fable 5 audit, and
   the function is now version 23 with paginated `discussion-media` cleanup.

## D3 — iOS authority: preliminary read, proof pending (2026-06-09)

Preliminary: `~/Pitch-Atlas-iOS` (clean, branch codex/blaze-companion-polish-ios,
in sync with origin) is authoritative. The dirty `~/code/Pitch-Atlas-iOS` tree
sits at a26c068 (an ancestor in the polish branch's history) with uncommitted
edits that appear to be an earlier draft of the Blaze-companion work committed
as d980d17 (the committed version includes controller, moods, tests, image sets
the dirty draft lacks). Phase 4 must diff dirty-tree changes against the polish
branch before declaring the dirty work superseded. Until then the dirty tree is
untouched.
