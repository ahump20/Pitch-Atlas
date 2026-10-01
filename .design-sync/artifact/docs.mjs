#!/usr/bin/env node
/*
  Writes the artifact's prose from this repo, so the repo is the one copy.

    node .design-sync/artifact/docs.mjs <project>

  - project/README.md: the authored head becomes brand-book.md, then
    not-synced.md; everything from the section after "Not synced" on (the
    page's Starters, Migrated and generated sections) is kept as published.
  - project/guidelines/docs/<name>.md: each DOC_SECTIONS file, copied from docs/.

  Run it on a working copy of the live project/ folder, after reading the
  artifact, and publish what it changes.
*/
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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
  for (const name of DOC_SECTIONS) copyFileSync(join(root, 'docs', name), join(out, name))
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
