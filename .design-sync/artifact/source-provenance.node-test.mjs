import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createFixtureRepo, FIXTURE_DATE } from './provenance-fixture.mjs'
import {
  hasMainHistory, recordBundleProvenance, resolveSourceCommit, sourceInputDigest, verifyBundleProvenance,
} from './source-provenance.mjs'

// Each test gets its own repository, so no case depends on another's leftovers.
function setup(t) {
  const repo = createFixtureRepo()
  t.after(repo.cleanup)
  mkdirSync(join(repo.root, 'ds-bundle'))
  const bundle = join(repo.root, 'ds-bundle/_ds_bundle.css')
  const manifest = join(repo.root, 'ds-bundle/.source-provenance.json')
  writeFileSync(bundle, ':root { --color-orange: #BF5700; }')
  return {
    ...repo,
    record: () => recordBundleProvenance(bundle, manifest, repo.root),
    verify: () => verifyBundleProvenance(repo.sourceRef, bundle, manifest, repo.root),
    bundle,
  }
}

test('a commit on origin/main resolves to its full hash', (t) => {
  const repo = setup(t)
  assert.equal(resolveSourceCommit(repo.sourceRef, repo.root), repo.git('rev-parse', 'HEAD'))
})

test('a source ref must name a commit that is on origin/main', async (t) => {
  const cases = [
    ['not main@<commit>', (repo) => repo.sourceRef.replace('main@', ''), /must be main@<commit>/],
    ['unknown commit', () => 'main@deadbee', /does not resolve/],
    ['commit past origin/main', (repo) => {
      repo.write('src/index.css', ':root { --color-void: #000000; }\n')
      return `main@${repo.commit('unpublished')}`
    }, /not on the verified origin\/main history/],
    ['no origin/main in the clone', (repo) => {
      repo.git('update-ref', '-d', 'refs/remotes/origin/main')
      return repo.sourceRef
    }, /refs\/remotes\/origin\/main is not in this clone/],
  ]
  for (const [name, arrange, pattern] of cases) {
    await t.test(name, (sub) => {
      const repo = setup(sub)
      assert.throws(() => resolveSourceCommit(arrange(repo), repo.root), pattern)
    })
  }
})

test('a shallow clone cannot run the history checks and says how to fix it', (t) => {
  const repo = setup(t)
  repo.write('src/index.css', ':root { --color-void: #000000; }\n')
  repo.commit('tip')
  const shallow = repo.shallowClone()
  assert.equal(hasMainHistory(repo.root), true)
  assert.equal(hasMainHistory(shallow), false)
  assert.throws(() => resolveSourceCommit(repo.sourceRef, shallow), /shallow clone: run git fetch --unshallow/)
})

test('verification returns what the bundle was built from', (t) => {
  const repo = setup(t)
  const manifest = repo.record()
  assert.deepEqual(repo.verify(), {
    sourceCommit: repo.git('rev-parse', 'HEAD'),
    commitDate: FIXTURE_DATE,
    bundleCssSha256: manifest.bundleCssSha256,
    sourceInputsSha256: manifest.sourceInputsSha256,
  })
})

test('verification rejects a bundle that no longer matches its source', async (t) => {
  const cases = [
    ['site source differs from the ref', (repo) => {
      repo.write('src/index.css', ':root { --color-void: #000000; }\n')
    }, /Token source files differ from --source-ref/],
    ['package build field differs from the ref', (repo) => {
      repo.write('package.json', JSON.stringify({ name: 'fixture', version: '1.0.0', type: 'module', dependencies: { left: '2.0.0' } }))
    }, /Package build inputs differ from --source-ref/],
    ['untracked source input', (repo) => {
      repo.write('src/new.css', '.a {}\n')
    }, /Untracked design-sync source input: src\/new\.css/],
    ['packaging guidance changed since the manifest', (repo) => {
      repo.write('.design-sync/conventions.md', '# changed\n')
    }, /source manifest is stale/],
    ['CSS bundle changed since the manifest', (repo) => {
      writeFileSync(repo.bundle, ':root { --color-orange: #FF6A29; }')
    }, /CSS differs from its build manifest/],
  ]
  for (const [name, arrange, pattern] of cases) {
    await t.test(name, (sub) => {
      const repo = setup(sub)
      repo.record()
      arrange(repo)
      assert.throws(() => repo.verify(), pattern)
    })
  }
})

test('test-script edits after the source commit are allowed, other package fields are not', (t) => {
  const repo = setup(t)
  const pkg = JSON.parse(repo.git('show', 'HEAD:package.json'))
  repo.write('package.json', JSON.stringify({ ...pkg, scripts: { test: 'vitest run && node --test' } }))
  repo.record()
  assert.equal(repo.verify().sourceCommit, repo.git('rev-parse', 'HEAD'))
})

test('the source digest follows tracked inputs only', (t) => {
  const repo = setup(t)
  const before = sourceInputDigest(repo.root)
  repo.write('README.md', 'not an input\n')
  assert.equal(sourceInputDigest(repo.root), before)
  repo.write('.design-sync/conventions.md', '# changed\n')
  assert.notEqual(sourceInputDigest(repo.root), before)
})
