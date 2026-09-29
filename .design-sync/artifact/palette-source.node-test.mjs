import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../..', import.meta.url))
const path = (name) => join(root, name)
const read = (name) => readFileSync(path(name), 'utf8')
const tokens = JSON.parse(read('.design-sync/artifact/tokens.json'))
const notes = read('.design-sync/NOTES.md')
const source = notes.match(/from (main@[0-9a-f]{7,40}) on (\d{4}-\d{2}-\d{2})/)
const pythonEnv = { ...process.env, PYTHONDONTWRITEBYTECODE: '1' }

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
  for (const name of ['foil', 'foil-type', 'ember']) {
    assert.match(css, new RegExp(`--${name}:\\s*linear-gradient\\(`))
    assert.ok(guide.includes(`var(--${name})`), `guide must demonstrate --${name}`)
  }
  assert.doesNotMatch(css, /--gold\s*:/)
  assert.doesNotMatch(guide, /var\(--gold\)|#ff2d6e|#caa14a/i)
  assert.match(guide, /there is no\s*<code>--gold<\/code> token/)
})

test('token builder drops carried gold and foil while retaining the other tokens', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pa-palette-'))
  try {
    const carried = structuredClone(tokens)
    carried.other.tokens.push({ name: 'gold', value: 'retired' })
    carried.other.tokens.push({ name: 'foil', value: 'retired' })
    const bundleCssSha256 = createHash('sha256').update(readFileSync(path('ds-bundle/_ds_bundle.css'))).digest('hex')
    const carriedJson = JSON.stringify(carried)
    const carriedSha256 = createHash('sha256').update(carriedJson).digest('hex')
    const resolved = { sourceRef: source[1], bundleCssSha256, carriedSha256,
      default: Object.fromEntries(carried.color.tokens.map(({ name, value }) =>
      [name, { raw: value, color: '' }])) }
    const input = join(dir, 'carried.json')
    const b = join(dir, 'b.json')
    const d = join(dir, 'd.json')
    writeFileSync(input, carriedJson)
    const resolvedPath = join(dir, 'resolved.json')
    writeFileSync(resolvedPath, JSON.stringify(resolved))
    const args = [path('.design-sync/artifact/build_tokens.py'), input, b, d,
      '--source-ref', source[1], '--synced', source[2]]
    const built = spawnSync('python3', args, { cwd: dir, encoding: 'utf8', env: pythonEnv })
    assert.equal(built.status, 0, built.stderr)
    const current = JSON.parse(readFileSync(d, 'utf8'))
    assert.deepEqual(current.other.tokens.map(({ name }) => name),
      tokens.other.tokens.map(({ name }) => name))
    assert.equal(current.meta.ref, source[1])
    assert.equal(current.meta.synced, source[2])
    assert.deepEqual(current.meta.components, tokens.meta.components)

    writeFileSync(resolvedPath, JSON.stringify({ ...resolved, sourceRef: 'main@deadbee' }))
    const mismatch = spawnSync('python3', args,
      { cwd: dir, encoding: 'utf8', env: pythonEnv })
    assert.notEqual(mismatch.status, 0)
    assert.match(mismatch.stderr, /resolved\.json sourceRef must exactly match --source-ref/)

    writeFileSync(resolvedPath, JSON.stringify({ ...resolved, bundleCssSha256: '0'.repeat(64) }))
    const staleBundle = spawnSync('python3', args,
      { cwd: dir, encoding: 'utf8', env: pythonEnv })
    assert.notEqual(staleBundle.status, 0)
    assert.match(staleBundle.stderr, /bundleCssSha256 does not match/)

    writeFileSync(resolvedPath, JSON.stringify({ ...resolved, carriedSha256: '0'.repeat(64) }))
    const staleCarried = spawnSync('python3', args,
      { cwd: dir, encoding: 'utf8', env: pythonEnv })
    assert.notEqual(staleCarried.status, 0)
    assert.match(staleCarried.stderr, /carriedSha256 does not match/)

    const futureDate = spawnSync('python3', [...args.slice(0, -2), '--synced', '9999-12-31'],
      { cwd: dir, encoding: 'utf8', env: pythonEnv })
    assert.notEqual(futureDate.status, 0)
    assert.match(futureDate.stderr, /cannot be after the current America\/Chicago date/)

    const invalid = spawnSync('python3', [...args.slice(0, -4),
      '--source-ref', 'main@deadbee', '--synced', source[2]],
      { cwd: dir, encoding: 'utf8', env: pythonEnv })
    assert.notEqual(invalid.status, 0)
    assert.match(invalid.stderr, /does not resolve/)

    writeFileSync(resolvedPath, JSON.stringify({ ...resolved, sourceRef: 'main@4098cbd' }))
    const staleBuildSource = spawnSync('python3', [...args.slice(0, -4),
      '--source-ref', 'main@4098cbd', '--synced', source[2]],
      { cwd: dir, encoding: 'utf8', env: pythonEnv })
    assert.notEqual(staleBuildSource.status, 0)
    assert.match(staleBuildSource.stderr, /token source files differ from --source-ref/)

    const missingRef = spawnSync('node',
      [path('.design-sync/artifact/resolve-tokens.mjs'), input, resolvedPath],
      { cwd: dir, encoding: 'utf8' })
    assert.equal(missingRef.status, 2)
    assert.match(missingRef.stderr, /--source-ref main@<commit>/)

    const staleSource = spawnSync('node',
      [path('.design-sync/artifact/resolve-tokens.mjs'), input, resolvedPath,
        '--source-ref', 'main@4098cbd'],
      { cwd: dir, encoding: 'utf8' })
    assert.equal(staleSource.status, 2)
    assert.match(staleSource.stderr, /Token source files differ from --source-ref/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
