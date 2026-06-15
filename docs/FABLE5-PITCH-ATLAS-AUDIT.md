# Fable 5 Pitch Atlas Audit — 2026-06-09

Run: `fable5/pitch-atlas-review-safe-sync` · Evidence: `docs/fable5/PITCH-EVIDENCE-LEDGER.jsonl` · Decisions: `docs/fable5/PITCH-DECISIONS.md` · Screens: `docs/fable5/screens/`

Status legend: **verified** (tool-checked this run) · **reasoned** (inferred, not directly checked) · **blocked** (needs credentials/approval/platform state).

Refresh note, 2026-06-14 UTC / 2026-06-13 CDT: the open-list rows were rechecked from
the current repo, GitHub, Supabase, and local render proof. Resolved rows below keep
the original finding text, but their status now reflects current evidence.

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
- Soft-404 finding is resolved in current source: `src/pages/NotFound.tsx`, the `*`
  route, `public/_redirects`, and the post-build `404.html` copy now ship a real
  not-found page instead of a 200 app shell for unknown paths.
- Full router × ssg-paths × sitemap × live matrix: `docs/route-map.pitch-atlas.json` (pending workflow output).

## 4. Supabase (project cloeoulvrrfcbitrjpso) — remediation list

Live access verified via the project-scoped MCP (the bare `supabase` MCP server is locked to the BSI project and was not used). Community schema fundamentals confirmed healthy: RLS on every public table, owner-scoped policies with admin/block-aware reads, private discussion-media bucket with mime allowlist, both clients on the publishable key against the right ref, delete-account JWT-verified and caller-only with FK cascades covering posts/notes/profile (auditor verified the cascades — resolving D4 condition 4).

| # | Item | Before | Action this run | After / status |
|---|---|---|---|---|
| 1 | Migration drift (HIGH, verified) | live 12 vs repo 5, zero matching versions; both Supabase git branches MIGRATIONS_FAILED | live migrations captured into repo through `20260614045210_community_grant_cleanup_followup.sql` | repo source mirrors live migration list; branch automation now reports `FUNCTIONS_DEPLOYED` with `ACTIVE_HEALTHY` preview status (rechecked 2026-06-14) |
| 2 | Default-ACL hole (HIGH, verified — BSI-incident root cause) | postgres + supabase_admin default ACLs grant full DML to anon/authenticated on every new table | `20260610162418_default_privilege_hardening.sql` applied live and kept in repo | resolved for postgres-created public objects; supabase_admin residual remains platform-managed |
| 3 | DM cluster residue (threads/messages/thread_participants) | anon+authenticated hold full DML; no SELECT for authenticated → feature unreachable; 0 rows | `20260610162459_dm_revoke_and_fk_indexes.sql` applied live and kept in repo | DML exposure resolved; product choice to enable or remove DM tables remains separate |
| 4 | 3 unindexed FKs | perf advisor INFO | `20260610162459_dm_revoke_and_fk_indexes.sql` applied live and kept in repo | resolved |
| 5 | pitches table missing 7 specimen slugs (live bug: note submit FK-fails on 7 of 12 specimens) | 5 rows vs 12 web specimens | `20260610162340_pitches_backfill_chapter_routes.sql` applied live and kept in repo | resolved |
| 6 | Anonymous-user minting on read path | 66/67 auth users anonymous; signInAnonymously() fires on listNotes | web client fix in this run's fix bundle (read without session; session only on write intent) | in work branch; live after deploy |
| 7 | banned_terms RLS-without-policy advisor | WARN | explained: deliberate default-deny (migration 20260605110439, now captured in repo) | documented intentional |
| 8 | pg_graphql anon/authenticated exposure WARNs | WARN on community/profile tables | disable unused `pg_graphql`; public REST reads stay unchanged | resolved after migration |
| 9 | cron.job anonymous-policy WARNs | WARN | pg_cron defaults, not project policies | documented no-action |
| 10 | Leaked-password protection disabled | WARN | dashboard-only toggle | **blocked: Austin** (belt-and-braces; password auth appears unused) |
| 11 | auth_rls_initplan ×30 (bare auth.uid() in 06-09 policies) | perf WARN | fold `(select auth.uid())` rewrite into the next policy-touching migration | documented advisory |
| 12 | profiles anon SELECT exposes is_admin; dead admin-read policies on report tables | low | `20260614045210_community_grant_cleanup_followup.sql` applied live and kept in repo | resolved: `is_admin` no longer selectable by anon/authenticated; report queues stay write-only to clients |
| 13 | delete-account storage list capped at 1000 objects | low | Edge Function v23 deployed with paginated listing and chunked removes; repo source updated | resolved |
| 14 | Orphaned Stripe engine (schema ~25 tables, 3 edge functions, every-minute pg_cron) | running, zero consumers, signature-verified webhook, not API-exposed | none (destructive teardown) | **Austin's decision** |

## 5. Stripe reality — CLASSIFIED

Repos (web + iOS): Stripe is **absent** — no code, residue, scaffolding, or boilerplate; the only "stripe" tokens are the Blaze dog mascot's helmet stripe (lexical coincidence). Live Supabase: **orphaned Stripe sync engine** (see §4 item 14). No commerce UI exists on any live route. iOS has zero StoreKit/IAP. Billing is out of scope for Pitch Atlas today; if it ever lands, iOS must use StoreKit, never Stripe checkout in-app.

## 6. iOS sync — authority decided (verified)

- **Authoritative tree: `~/Pitch-Atlas-iOS`** (codex/blaze-companion-polish-ios). Adversarially verified.
- **The dirty `~/code` tree is NOT discardable**: 19 of 28 dirty files are the never-committed iOS no-fake-numbers content pass. The committed app still bundles 12 spinRateRpm + ivbInches claims and REQUIRES those numeric fields, out of contract with the web's words-only physics schema. Salvage agent is porting B's pass onto a branch off A with the build/test gate.
- Topology: linear chain; iOS PR #1 (community + Apple sign-in) MERGED to remote main; companion commit d980d17 is the only unmerged work (no PR yet); both local clones had stale origin/main.
- App Store safety inventory passes on A: SIWA entitlement+UI, delete-account UI→deployed function, report/block writes, privacy manifest declaring community data without tracking. Block-edge content filtering is enforced server-side by the live RLS (PR #16's captured migration) — the iOS auditor's open question is answered by the Supabase auditor's live policy dump.
- Stale-doc hazards: B's untracked App Store Connect pack says "no account, no network" (now false — rewrite in salvage); A's CLAUDE.md documents a phantom WKWebView architecture (fix from B's hunks).

## 7. PWA/offline (verified, one residual)

Design is honest (see §1). Residual: in-browser offline toggle proof — blocked while the headless Chrome is held by an auditor; to be run before close.

## 8. Open issue list (running)

| # | Sev | Area | Issue | Status |
|---|---|---|---|---|
| 1 | med | routes | Soft-404: unknown paths return 200 + home doc; no 404.html / not-found view proof | RESOLVED — current source ships `404.html` from `NotFound`; deploy workflow checks unknown route returns 404 |
| 2 | med | supabase | PR #16 gitlink defect blocks merge | RESOLVED — PR #16 merged on 2026-06-09 |
| 3 | low | supabase | field_notes UPDATE policy dead (no grant) | RESOLVED — live/source migration `20260614045210` restores narrow owner update grants and `note_tries.outcome_kind` update |
| 4 | med | supabase | delete-account cascade assumption (posts/notes/profiles) | RESOLVED — cascades verified live |
| 5 | low | design | Hero specimen card: clipped chip artifact top-left | RESOLVED — local render proof shows chip and stamp contained on desktop/mobile |
| 6 | low | design | Softball "S START HERE" stray drop-cap | RESOLVED — local render proof shows `00 START HERE` with no stray drop-cap or overflow |
| 7 | low | repo | Stale untracked dist/ in repo root | note only — no `dist/` is currently shown by `git status`; unrelated untracked user folders are preserved |
| 8 | med | supabase | Supabase GitHub branch automation reports MIGRATIONS_FAILED (per PR #16 body) | RESOLVED — rechecked via Supabase connector on 2026-06-14; main reports `FUNCTIONS_DEPLOYED` and preview status `ACTIVE_HEALTHY` |
