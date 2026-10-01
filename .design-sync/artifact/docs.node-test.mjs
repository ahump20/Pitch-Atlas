import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DOC_SECTIONS, assembleReadme, repoRoot, unwrapBullets, wrappedBulletLines, writeDocs } from './docs.mjs'

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
    assert.deepEqual(wrappedBulletLines(read(file)).map((i) => `${file}:${i + 1}`), [])
  }
})

test('unwrapping joins bullet continuations and nothing else', () => {
  const md = '# T\n\n- one\n  two\n- three\n  - nested\n    four\n\npara\nline\n\n```\n- code\n  kept\n```\n1. first\nlazy\n| a |\n'
  assert.deepEqual(wrappedBulletLines(md), [3, 6, 16])
  assert.equal(unwrapBullets(md), '# T\n\n- one two\n- three\n  - nested four\n\npara\nline\n\n```\n- code\n  kept\n```\n1. first lazy\n| a |\n')
})

test('each doc section the page shows is a tracked doc, its bullets unwrapped and its words intact', () => {
  const project = mkdtempSync(join(tmpdir(), 'pa-docs-'))
  try {
    writeFileSync(join(project, 'README.md'), PUBLISHED)
    const written = writeDocs(project)
    assert.equal(written.length, DOC_SECTIONS.length + 1)
    for (const name of DOC_SECTIONS) {
      assert.ok(existsSync(join(repoRoot, 'docs', name)), `docs/${name} is missing`)
      const published = readFileSync(join(project, 'guidelines', 'docs', name), 'utf8')
      assert.deepEqual(wrappedBulletLines(published), [], `${name} still wraps a bullet`)
      const words = (text) => text.split(/\s+/).join(' ')
      assert.equal(words(published), words(read(`docs/${name}`)), `${name} lost or changed text`)
    }
    const readme = readFileSync(join(project, 'README.md'), 'utf8')
    assert.ok(readme.startsWith(read('.design-sync/artifact/brand-book.md').trimEnd()))
    assert.ok(readme.includes('## Starters\n\n- kept'))
  } finally {
    rmSync(project, { recursive: true, force: true })
  }
})
