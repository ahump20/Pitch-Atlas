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

Conditions before merge:
1. Remove the accidental gitlink commit of pitch-atlas-softball (mode 160000
   entry) from the PR. It would add a phantom submodule.
2. Confirm with the Supabase auditor that live migrations list includes both
   migrations and advisors reflect the grant cleanup.
3. Flag (not block): field_notes_update_own policy exists but UPDATE was never
   granted to authenticated, so the policy is dead through the API. Either
   intentional (immutable notes) or needs a grant — decide at merge time.
4. delete-account does not explicitly delete discussion_posts / field_notes /
   profiles rows; verify those FKs cascade from auth.users before calling the
   App Store deletion story complete.

## D3 — iOS authority: preliminary read, proof pending (2026-06-09)

Preliminary: `~/Pitch-Atlas-iOS` (clean, branch codex/blaze-companion-polish-ios,
in sync with origin) is authoritative. The dirty `~/code/Pitch-Atlas-iOS` tree
sits at a26c068 (an ancestor in the polish branch's history) with uncommitted
edits that appear to be an earlier draft of the Blaze-companion work committed
as d980d17 (the committed version includes controller, moods, tests, image sets
the dirty draft lacks). Phase 4 must diff dirty-tree changes against the polish
branch before declaring the dirty work superseded. Until then the dirty tree is
untouched.
