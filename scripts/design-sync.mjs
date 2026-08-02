#!/usr/bin/env node
/*
  The guardrail in front of .ds-sync/resync.mjs.

  The driver lives in `.ds-sync/`, which is gitignored and re-vendored by the
  design-sync skill. Nothing written there survives, so nothing is written
  there. This file is tracked, and it is where the two traps documented in
  `.design-sync/NOTES.md` stop being prose and start being enforced.

  Trap 1 — `--entry` is optional in the driver (`if (flag('entry'))`), and
  omitting it silently drops the three components the ds barrel re-exports
  from outside `srcDir`: BrandMark, ConfidenceDot, PitchSpecimenCard. The
  build still prints success and the manifest still lists all 19, because the
  manifest comes from `cfg.componentSrcMap` and never from what bundled. We
  always pass `--entry`, and we fail if the barrel is not on disk.

  Trap 2 — `cfg.cssEntry` is a hashed dist filename. The hash changes on every
  `vite build`, so any stored value is one build away from pointing at nothing.
  We resolve it from `dist/index.html` — the artifact that names the stylesheet
  the app actually loads — rather than storing a guess or picking the largest
  file. Ordering follows NOTES: build first, re-point second, sync third.

  Usage:
    node scripts/design-sync.mjs            # preflight, build, re-point, sync
    node scripts/design-sync.mjs --check    # preflight only; no build, no sync
    node scripts/design-sync.mjs --skip-build   # sync against the current dist
*/

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const REPO = process.cwd()
const CONFIG = '.design-sync/config.json'
const DRIVER = '.ds-sync/resync.mjs'
const ENTRY = './src/components/ds/index.ts'
const NODE_MODULES = 'node_modules'
const OUT = 'ds-bundle'
const DIST_HTML = 'dist/index.html'

const argv = process.argv.slice(2)
const CHECK_ONLY = argv.includes('--check')
const SKIP_BUILD = argv.includes('--skip-build')

const die = (msg) => {
  console.error(`✗ ${msg}`)
  process.exit(1)
}
const ok = (msg) => console.error(`✓ ${msg}`)

/* Run from the repo root: every path in the config is relative to it, and the
   driver resolves cssEntry against the package root it is handed. */
if (!existsSync(resolve(REPO, CONFIG))) {
  die(`${CONFIG} not found from ${REPO} — run this from the repo root`)
}

/* The driver is vendored and gitignored, so a fresh clone will not have it.
   Say so plainly instead of dying on a missing module. */
if (!existsSync(resolve(REPO, DRIVER))) {
  die(
    `${DRIVER} not found — the design-sync driver is gitignored and vendored ` +
      `per-machine. Run the /design-sync skill once to install it, then retry.`,
  )
}

/* Trap 1, first half: the barrel must exist before we promise the driver it does. */
if (!existsSync(resolve(REPO, ENTRY))) {
  die(
    `${ENTRY} not found — this is the ds barrel that --entry points at. ` +
      `Without it the bundle silently loses BrandMark, ConfidenceDot and PitchSpecimenCard.`,
  )
}
ok(`ds barrel present: ${ENTRY}`)

/* Trap 1, second half: those three are re-exported from outside srcDir, which is
   exactly why they are the ones that vanish. If the barrel stops re-exporting one,
   --entry will not save it, and the failure looks identical. Check the cause, not
   just the flag. */
const barrel = readFileSync(resolve(REPO, ENTRY), 'utf8')
const FRAGILE = ['BrandMark', 'ConfidenceDot', 'PitchSpecimenCard']
const missing = FRAGILE.filter((name) => !new RegExp(`\\b${name}\\b`).test(barrel))
if (missing.length) {
  die(
    `${ENTRY} no longer re-exports: ${missing.join(', ')}. These live outside ` +
      `srcDir and reach the bundle only through this barrel — they will be absent ` +
      `from window.PitchAtlas and validate will report them as "root empty".`,
  )
}
ok(`barrel re-exports all ${FRAGILE.length} out-of-srcDir components`)

/* NOTES ordering rule: re-point cssEntry AFTER the last app build, never before.
   Building here is what makes that ordering structural instead of remembered. */
if (!CHECK_ONLY && !SKIP_BUILD) {
  console.error('› npm run build (the hash must be settled before we read it)')
  const built = spawnSync('npm', ['run', 'build'], { cwd: REPO, stdio: 'inherit' })
  if (built.status !== 0) die('app build failed — not syncing a stale bundle')
  ok('app build clean')
}

/* Trap 2: resolve the stylesheet from the artifact that names it. dist/ holds
   more than one index-*.css — a CSS-module chunk sits alongside the app sheet —
   so "largest file" is a guess that happens to be right. The <link> is not. */
if (!existsSync(resolve(REPO, DIST_HTML))) {
  die(
    `${DIST_HTML} not found — run \`npm run build\` first, or drop --skip-build. ` +
      `cssEntry is resolved from the built HTML, not stored.`,
  )
}
const html = readFileSync(resolve(REPO, DIST_HTML), 'utf8')
const linked = [
  ...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi),
]
  .map((m) => /href=["']([^"']+\.css)["']/i.exec(m[0])?.[1])
  .filter(Boolean)
  .map((href) => href.replace(/^\//, ''))

const unique = [...new Set(linked)]
if (unique.length === 0) {
  die(`${DIST_HTML} links no stylesheet — cannot resolve cssEntry. Check the build.`)
}
if (unique.length > 1) {
  die(
    `${DIST_HTML} links ${unique.length} stylesheets (${unique.join(', ')}). ` +
      `cssEntry takes one file; pick deliberately rather than letting this script guess.`,
  )
}

const cssEntry = `dist/${unique[0]}`
if (!existsSync(resolve(REPO, cssEntry))) {
  die(`${DIST_HTML} links ${cssEntry}, but that file is not on disk — the build is inconsistent.`)
}

const cfgPath = resolve(REPO, CONFIG)
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'))
if (cfg.cssEntry !== cssEntry) {
  if (CHECK_ONLY) {
    die(
      `cfg.cssEntry is "${cfg.cssEntry}" but the built app loads "${cssEntry}". ` +
        `Stale hash — run \`npm run design-sync\` (or --skip-build) to re-point it.`,
    )
  }
  cfg.cssEntry = cssEntry
  writeFileSync(cfgPath, `${JSON.stringify(cfg, null, 2)}\n`)
  ok(`cssEntry re-pointed → ${cssEntry}`)
} else {
  ok(`cssEntry current → ${cssEntry}`)
}

if (CHECK_ONLY) {
  ok('preflight clean (no build, no sync)')
  process.exit(0)
}

/* --entry is passed unconditionally. That is the whole point of this file. */
const args = [
  DRIVER,
  '--config', CONFIG,
  '--node-modules', NODE_MODULES,
  '--out', OUT,
  '--entry', ENTRY,
  ...argv.filter((a) => a !== '--check' && a !== '--skip-build'),
]
console.error(`› node ${args.join(' ')}`)
const run = spawnSync('node', args, { cwd: REPO, stdio: 'inherit' })
process.exit(run.status ?? 1)
