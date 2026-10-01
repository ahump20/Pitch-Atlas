import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DOC_SECTIONS, assembleReadme, repoRoot, writeDocs } from './docs.mjs'

const read = (rel) => readFileSync(join(repoRoot, rel), 'utf8')
const PUBLISHED = '# old head\n\n## Not synced\n\n- old\n\n## Starters\n\n- kept\n\n---\n\n## Consuming this system (generated — do not edit)\n\nkept\n'

test('the README is the brand book, then Not synced, then the page sections as published', () => {
  const out = assembleReadme(PUBLISHED, '# head\n\n- new\n', '## Not synced\n\n- current\n')
  assert.equal(out, '# head\n\n- new\n\n## Not synced\n\n- current\n\n## Starters\n\n- kept\n\n---\n\n## Consuming this system (generated — do not edit)\n\nkept\n')
  assert.equal(assembleReadme(out, '# head\n\n- new\n', '## Not synced\n\n- current\n'), out)
  assert.throws(() => assembleReadme('# no section\n', '', '## Not synced\n'), /no "## Not synced"/)
})

test('every bullet in the tracked prose is one line', () => {
  // The page splits a list item at its first line break: a wrapped bullet
  // renders as a bullet plus a stray paragraph.
  for (const file of ['.design-sync/artifact/brand-book.md', '.design-sync/artifact/not-synced.md']) {
    const lines = read(file).split('\n')
    lines.forEach((line, i) => {
      if (i && /^- /.test(lines[i - 1]) && line.trim() && !/^(- |\|)/.test(line)) {
        assert.fail(`${file}:${i + 1} continues the bullet above it`)
      }
    })
  }
})

test('each doc section the page shows is a tracked doc, copied verbatim', () => {
  const project = mkdtempSync(join(tmpdir(), 'pa-docs-'))
  try {
    writeFileSync(join(project, 'README.md'), PUBLISHED)
    const written = writeDocs(project)
    assert.equal(written.length, DOC_SECTIONS.length + 1)
    for (const name of DOC_SECTIONS) {
      assert.ok(existsSync(join(repoRoot, 'docs', name)), `docs/${name} is missing`)
      assert.equal(readFileSync(join(project, 'guidelines', 'docs', name), 'utf8'), read(`docs/${name}`))
    }
    const readme = readFileSync(join(project, 'README.md'), 'utf8')
    assert.ok(readme.startsWith(read('.design-sync/artifact/brand-book.md').trimEnd()))
    assert.ok(readme.includes('## Starters\n\n- kept'))
  } finally {
    rmSync(project, { recursive: true, force: true })
  }
})
