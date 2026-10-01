// A throwaway git repository shaped like this one (every input
// source-provenance.mjs hashes, plus the config build_tokens.py reads), so the
// provenance tests run against history they build themselves instead of the
// clone they happen to run in.
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

export const FIXTURE_DATE = '2026-01-15'

// Hermetic git for this process and its children: no inherited GIT_* state (a
// hook's GIT_DIR would redirect every command), no user or system config, one
// author, and a fixed commit date so date checks never depend on the clock.
for (const key of Object.keys(process.env)) if (key.startsWith('GIT_')) delete process.env[key]
const identity = { NAME: 'fixture', EMAIL: 'fixture@example.com', DATE: `${FIXTURE_DATE}T12:00:00Z` }
Object.assign(process.env, {
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: identity.NAME, GIT_AUTHOR_EMAIL: identity.EMAIL, GIT_AUTHOR_DATE: identity.DATE,
  GIT_COMMITTER_NAME: identity.NAME, GIT_COMMITTER_EMAIL: identity.EMAIL, GIT_COMMITTER_DATE: identity.DATE,
})

export const FIXTURE_COMPONENTS = { Button: 'src/components/ds/Button.tsx' }

const FILES = {
  'package.json': JSON.stringify({
    name: 'fixture', version: '1.0.0', type: 'module',
    dependencies: { left: '1.0.0' }, scripts: { test: 'node --test' },
  }, null, 2),
  'package-lock.json': '{}\n',
  'index.html': '<!doctype html>\n',
  'vite.config.ts': 'export default {}\n',
  'src/index.css': ':root { --color-void: #070509; }\n',
  'public/robots.txt': 'User-agent: *\n',
  'scripts/design-sync.mjs': '// wrapper\n',
  '.design-sync/config.json': JSON.stringify({ componentSrcMap: FIXTURE_COMPONENTS }, null, 2),
  '.design-sync/previews/Button.tsx': 'export default () => null\n',
  '.design-sync/doc-groups/Button.md': '---\ncategory: Primitives\n---\n',
  '.design-sync/extra-exports.ts': 'export {}\n',
  '.design-sync/ds-router.tsx': 'export {}\n',
  '.design-sync/conventions.md': '# conventions\n',
  '.design-sync/guidelines/card.html': '<p>card</p>\n',
}

// One commit of FILES on main, with origin/main pointing at it (as a fetched
// clone would have). sourceRef names that commit the way --source-ref does.
export function createFixtureRepo() {
  const parent = mkdtempSync(join(tmpdir(), 'pa-fixture-'))
  const root = join(parent, 'repo')
  mkdirSync(root)
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim()
  const write = (relative, content) => {
    mkdirSync(dirname(join(root, relative)), { recursive: true })
    writeFileSync(join(root, relative), content)
  }
  const commit = (message) => {
    git('add', '-A')
    git('commit', '-q', '-m', message)
    return git('rev-parse', '--short=7', 'HEAD')
  }

  git('init', '-q')
  git('symbolic-ref', 'HEAD', 'refs/heads/main')
  for (const [relative, content] of Object.entries(FILES)) write(relative, content)
  const base = commit('source')
  git('update-ref', 'refs/remotes/origin/main', 'HEAD')

  return {
    root,
    git,
    write,
    commit,
    sourceRef: `main@${base}`,
    // A depth-1 clone of the fixture's current tip: the shape of a default CI checkout.
    shallowClone() {
      const target = join(parent, 'shallow')
      execFileSync('git', ['clone', '-q', '--depth', '1', `file://${root}`, target])
      return target
    },
    cleanup: () => rmSync(parent, { recursive: true, force: true }),
  }
}
