import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createFixtureRepo, FIXTURE_COMPONENTS, FIXTURE_DATE } from './provenance-fixture.mjs'
import { recordBundleProvenance } from './source-provenance.mjs'

const root = fileURLToPath(new URL('../..', import.meta.url))
const path = (name) => join(root, name)
const read = (name) => readFileSync(path(name), 'utf8')
const tokens = JSON.parse(read('.design-sync/artifact/tokens.json'))
const notes = read('.design-sync/NOTES.md')
const source = notes.match(/from (main@[0-9a-f]{7,40}) on (\d{4}-\d{2}-\d{2})/)
const pythonEnv = { ...process.env, PYTHONDONTWRITEBYTECODE: '1' }
const builder = path('.design-sync/artifact/build_tokens.py')
const ZERO = '0'.repeat(64)
const sha256 = (text) => createHash('sha256').update(text).digest('hex')

test('tracked palette and provenance match the documented source', () => {
  assert.ok(source, 'design-sync notes must state a source commit and sync date')
  assert.equal(tokens.meta.ref, source[1])
  assert.equal(tokens.meta.synced, source[2])
  assert.deepEqual(tokens.meta.components,
    JSON.parse(read('.design-sync/config.json')).componentSrcMap)
  assert.equal(tokens.other.tokens.some(({ name }) => name === 'gold'), false)
  assert.equal(tokens.color.tokens.some(({ name }) => name === 'cb-gold-ink'), true)

  const css = read('src/index.css')
  const guide = read('.design-sync/guidelines/colors-metallics.card.html')
  const conventions = read('.design-sync/conventions.md')
  for (const name of ['foil', 'foil-type', 'ember']) {
    assert.match(css, new RegExp(`--${name}:\\s*linear-gradient\\(`))
    assert.ok(guide.includes(`var(--${name})`), `guide must demonstrate --${name}`)
  }
  assert.doesNotMatch(css, /--gold\s*:/)
  assert.doesNotMatch(guide, /var\(--gold\)|#ff2d6e|#caa14a/i)
  assert.match(guide, /there is no\s*<code>--gold<\/code> token/)
  assert.match(conventions, /burnt-orange foil/)
  assert.match(conventions, /var\(--foil-type\)/)
  assert.doesNotMatch(conventions, /rainbow|gold glint|golden glint/i)
})

// A throwaway repo plus everything build_tokens.py reads from it: a recorded bundle and
// manifest, the carried token table (with the retired gold and foil rows the builder must
// drop) and a resolved.json that matches them. History is the fixture's own, never this clone's.
function builderFixture(t) {
  const repo = createFixtureRepo()
  t.after(repo.cleanup)
  mkdirSync(join(repo.root, 'ds-bundle'))
  const bundlePath = join(repo.root, 'ds-bundle/_ds_bundle.css')
  const manifestPath = join(repo.root, 'ds-bundle/.source-provenance.json')
  writeFileSync(bundlePath, ':root { --color-orange: #BF5700; }')
  const manifest = recordBundleProvenance(bundlePath, manifestPath, repo.root)

  const carried = structuredClone(tokens)
  carried.other.tokens.push({ name: 'gold', value: 'retired' }, { name: 'foil', value: 'retired' })
  const carriedJson = JSON.stringify(carried)
  const resolved = {
    sourceRef: repo.sourceRef,
    bundleCssSha256: manifest.bundleCssSha256,
    sourceInputsSha256: manifest.sourceInputsSha256,
    carriedSha256: sha256(carriedJson),
    default: Object.fromEntries(carried.color.tokens.map(({ name, value }) =>
      [name, { raw: value, color: '' }])),
  }
  mkdirSync(join(repo.root, 'out'))
  const files = ['carried', 'b', 'd', 'resolved'].reduce(
    (acc, name) => ({ ...acc, [name]: join(repo.root, 'out', `${name}.json`) }), {})
  writeFileSync(files.carried, carriedJson)
  const writeResolved = (overrides = {}) =>
    writeFileSync(files.resolved, JSON.stringify({ ...resolved, ...overrides }))
  writeResolved()
  const build = (extra = []) => spawnSync('python3', [builder, files.carried, files.b, files.d,
    '--resolved', files.resolved, '--bundle-css', bundlePath, '--bundle-manifest', manifestPath,
    '--repo-root', repo.root, '--source-ref', repo.sourceRef, '--synced', FIXTURE_DATE, ...extra],
  { cwd: repo.root, encoding: 'utf8', env: pythonEnv })
  return { repo, files, manifest, manifestPath, writeResolved, build }
}

test('token builder drops carried gold and foil while retaining the other tokens', (t) => {
  const { repo, files, build } = builderFixture(t)
  const built = build()
  assert.equal(built.status, 0, built.stderr)
  const current = JSON.parse(readFileSync(files.d, 'utf8'))
  assert.deepEqual(current.other.tokens.map(({ name }) => name),
    tokens.other.tokens.map(({ name }) => name))
  assert.equal(current.meta.ref, repo.sourceRef)
  assert.equal(current.meta.synced, FIXTURE_DATE)
  assert.deepEqual(current.meta.components, FIXTURE_COMPONENTS)
})

test('token builder rejects stale or mismatched provenance', async (t) => {
  const cases = [
    ['resolved.json is missing', ({ repo }) => ['--resolved', join(repo.root, 'missing.json')],
      /is missing; run resolve-tokens\.mjs first/],
    ['resolved.json names another source ref', ({ writeResolved }) => writeResolved({ sourceRef: 'main@deadbee' }),
      /resolved\.json sourceRef must exactly match --source-ref/],
    ['resolved.json has a stale CSS hash', ({ writeResolved }) => writeResolved({ bundleCssSha256: ZERO }),
      /bundleCssSha256 does not match/],
    ['resolved.json has a stale carried hash', ({ writeResolved }) => writeResolved({ carriedSha256: ZERO }),
      /carriedSha256 does not match/],
    ['bundle manifest is stale', ({ manifest, manifestPath }) =>
      writeFileSync(manifestPath, JSON.stringify({ ...manifest, sourceInputsSha256: ZERO })),
    /source manifest is stale/],
    ['--synced is in the future', () => ['--synced', '9999-12-31'],
      /cannot be after the current America\/Chicago date/],
    ['--synced precedes the source commit', () => ['--synced', '2026-01-14'],
      /--synced precedes the source commit date/],
    ['source ref does not resolve', () => ['--source-ref', 'main@deadbee'], /does not resolve/],
    ['site source differs from the source ref', ({ repo }) =>
      repo.write('src/index.css', ':root { --color-void: #000000; }\n'),
    /token source files differ from --source-ref/i],
  ]
  for (const [name, arrange, pattern] of cases) {
    await t.test(name, (sub) => {
      const fixture = builderFixture(sub)
      const rejected = fixture.build(arrange(fixture) ?? [])
      assert.notEqual(rejected.status, 0)
      assert.match(rejected.stderr, pattern)
    })
  }
})

test('resolve-tokens exits before measuring when the source ref is missing or unresolvable', () => {
  const resolver = path('.design-sync/artifact/resolve-tokens.mjs')
  const missingRef = spawnSync('node', [resolver, 'carried.json', 'resolved.json'], { encoding: 'utf8' })
  assert.equal(missingRef.status, 2)
  assert.match(missingRef.stderr, /--source-ref main@<commit>/)

  const unresolvable = spawnSync('node',
    [resolver, 'carried.json', 'resolved.json', '--source-ref', 'main@deadbee'], { encoding: 'utf8' })
  assert.equal(unresolvable.status, 2)
  assert.match(unresolvable.stderr, /does not resolve/)
})
