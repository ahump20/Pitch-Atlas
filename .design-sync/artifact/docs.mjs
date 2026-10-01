#!/usr/bin/env node
/*
  Writes the artifact's prose from this repo, so the repo is the one copy.

    node .design-sync/artifact/docs.mjs <project>

  - project/README.md: the authored head becomes brand-book.md, then
    not-synced.md; everything from the section after "Not synced" on (the
    page's Starters, Migrated and generated sections) is kept as published.
  - project/guidelines/docs/<name>.md: each DOC_SECTIONS file from docs/, with
    each hard-wrapped bullet joined onto one line. The page splits a list item at
    its first line break, so a wrapped bullet would render as a bullet plus a
    stray paragraph; docs/ keeps its wrapping for reading in git.

  Run it on a working copy of the live project/ folder, after reading the
  artifact, and publish what it changes.
*/
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
export const repoRoot = join(here, '..', '..')

// The repo docs the page shows as prose sections, in the page's path order.
export const DOC_SECTIONS = [
  'BLAZE-COMPANION.md', 'FABLE5-PITCH-ATLAS-AUDIT.md', 'MEDIA-LEDGER.md', 'NORTHSTAR.md',
  'PITCH-ATLAS-IOS-SYNC.md', 'PLATFORM-CONTRACT.md', 'WABI-SABI-MOTION.md',
  'cijntje-switch-pitcher-brief.md', 'community-media-moderation.md', 'custom-domain.md',
  'design-language.md', 'ios-app-plan.md', 'repo-foundation.md',
  'research-expansion-shortlist.md', 'seam-calibration.md',
]

const NOT_SYNCED = '## Not synced'

const FENCE = /^\s*(```|~~~)/
const ITEM = /^\s*([-*+]|\d+[.)])\s/
const BLOCK = /^\s*(#|\||>)/

// Index of each line that continues the list item above it (outside fences).
export function wrappedBulletLines(md) {
  const hits = []
  let fence = false
  let item = false
  md.split('\n').forEach((line, i) => {
    if (FENCE.test(line)) { fence = !fence; item = false; return }
    if (fence) return
    if (ITEM.test(line)) { item = true; return }
    if (item && line.trim() && !BLOCK.test(line)) { hits.push(i); return }
    item = false
  })
  return hits
}

export function unwrapBullets(md) {
  const join = new Set(wrappedBulletLines(md))
  const out = []
  md.split('\n').forEach((line, i) => {
    if (join.has(i)) out[out.length - 1] = `${out[out.length - 1].trimEnd()} ${line.trim()}`
    else out.push(line)
  })
  return out.join('\n')
}

export function assembleReadme(published, brandBook, notSynced) {
  const start = published.indexOf(`\n${NOT_SYNCED}\n`)
  if (start < 0) throw new Error(`published README has no "${NOT_SYNCED}" section`)
  const next = published.indexOf('\n## ', start + NOT_SYNCED.length + 1)
  if (next < 0) throw new Error(`published README has nothing after "${NOT_SYNCED}"`)
  if (!notSynced.startsWith(`${NOT_SYNCED}\n`)) throw new Error(`not-synced.md must open with "${NOT_SYNCED}"`)
  return `${brandBook.trimEnd()}\n\n${notSynced.trimEnd()}\n${published.slice(next)}`
}

export function writeDocs(project, root = repoRoot) {
  const readme = join(project, 'README.md')
  const read = (rel) => readFileSync(join(root, rel), 'utf8')
  writeFileSync(readme, assembleReadme(readFileSync(readme, 'utf8'),
    read('.design-sync/artifact/brand-book.md'), read('.design-sync/artifact/not-synced.md')))
  const out = join(project, 'guidelines', 'docs')
  mkdirSync(out, { recursive: true })
  for (const name of DOC_SECTIONS) {
    writeFileSync(join(out, name), unwrapBullets(readFileSync(join(root, 'docs', name), 'utf8')))
  }
  return ['README.md', ...DOC_SECTIONS.map((name) => `guidelines/docs/${name}`)]
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const project = process.argv[2]
  if (!project) {
    console.error('usage: node .design-sync/artifact/docs.mjs <project>')
    process.exit(2)
  }
  for (const path of writeDocs(project)) console.log(`wrote project/${path}`)
}
