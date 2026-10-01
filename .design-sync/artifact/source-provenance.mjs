// Bind a design-sync CSS bundle to the source tree that produced it. The
// repository's build wrapper writes this ignored manifest only after a full
// app build and a successful design-sync run; --skip-build preserves it.
//
// The checks split by what they need. Naming a source commit needs history
// (the commit itself, and origin/main to prove it landed): resolveSourceCommit.
// Everything else reads only the working tree and the local manifest. Every
// function takes the repo root, so tests run against a throwaway repository
// and never depend on the clone they happen to run in.
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDeepStrictEqual, parseArgs } from 'node:util'

export const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
export const defaultBundle = join(repoRoot, 'ds-bundle/_ds_bundle.css')
export const defaultManifest = join(repoRoot, 'ds-bundle/.source-provenance.json')

const MAIN_REF = 'refs/remotes/origin/main'
const SOURCE_REF = /^main@[0-9a-f]{7,40}$/

// The main ref identifies the site's checked-in app and design input tree.
// The local manifest additionally binds current packaging guidance and tools,
// which may evolve without a site-source change.
const siteInputs = [
  'src', 'public', 'index.html', 'vite.config.ts', 'package-lock.json',
  '.design-sync/config.json', '.design-sync/previews', '.design-sync/doc-groups',
  '.design-sync/extra-exports.ts', '.design-sync/ds-router.tsx',
]
const bundleInputs = [...siteInputs, 'package.json', 'scripts/design-sync.mjs',
  '.design-sync/conventions.md', '.design-sync/guidelines']
const packageBuildFields = [
  'name', 'version', 'type', 'engines', 'dependencies', 'devDependencies',
  'optionalDependencies', 'peerDependencies', 'overrides', 'browserslist',
  'sideEffects', 'imports', 'exports',
]

function git(root, args) {
  return spawnSync('git', ['-C', root, ...args], { encoding: null })
}

function gitText(root, args) {
  const result = git(root, args)
  if (result.status !== 0) throw new Error(result.stderr.toString('utf8').trim() || `git ${args[0]} failed`)
  return result.stdout.toString('utf8').trim()
}

function gitPaths(root, args) {
  const result = git(root, [...args.slice(0, 1), '-z', ...args.slice(1)])
  if (result.status !== 0) throw new Error(result.stderr.toString('utf8').trim() || `git ${args[0]} failed`)
  return result.stdout.toString('utf8').split('\0').filter(Boolean)
}

const hasMainRef = (root) => git(root, ['rev-parse', '--verify', '--quiet', `${MAIN_REF}^{commit}`]).status === 0
const isShallow = (root) => git(root, ['rev-parse', '--is-shallow-repository']).stdout.toString('utf8').trim() === 'true'

// True where the history checks can run: origin/main is fetched and not truncated.
export function hasMainHistory(root = repoRoot) {
  return hasMainRef(root) && !isShallow(root)
}

function trackedInputs(root) {
  const untracked = gitPaths(root, ['ls-files', '--others', '--exclude-standard', '--', ...bundleInputs])
  if (untracked.length) throw new Error(`Untracked design-sync source input: ${untracked[0]}`)
  return gitPaths(root, ['ls-files', '--', ...bundleInputs]).sort()
}

export function sourceInputDigest(root = repoRoot) {
  const hash = createHash('sha256')
  for (const relative of trackedInputs(root)) {
    const bytes = readFileSync(join(root, relative))
    hash.update(relative).update('\0').update(String(bytes.length)).update('\0').update(bytes)
  }
  return hash.digest('hex')
}

function cssDigest(bundlePath) {
  return createHash('sha256').update(readFileSync(bundlePath)).digest('hex')
}

export function recordBundleProvenance(bundlePath = defaultBundle, manifestPath = defaultManifest, root = repoRoot) {
  const manifest = {
    format: 1,
    sourceInputsSha256: sourceInputDigest(root),
    bundleCssSha256: cssDigest(bundlePath),
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}

// The history half of the gate: the stated commit exists here and is on origin/main.
// Returns the full commit hash.
export function resolveSourceCommit(sourceRef, root = repoRoot) {
  if (!SOURCE_REF.test(sourceRef)) throw new Error('--source-ref must be main@<commit>')
  const shortSha = sourceRef.slice('main@'.length)
  let sourceCommit
  try {
    sourceCommit = gitText(root, ['rev-parse', '--verify', `${shortSha}^{commit}`])
  } catch {
    const hint = isShallow(root) ? ' (shallow clone: run git fetch --unshallow origin main)' : ''
    throw new Error(`Source ref does not resolve to the stated commit in this repository${hint}`)
  }
  if (!sourceCommit.startsWith(shortSha)) throw new Error('Source ref does not resolve to the stated commit')

  if (!hasMainRef(root)) throw new Error(`${MAIN_REF} is not in this clone; run git fetch origin main`)
  if (git(root, ['merge-base', '--is-ancestor', sourceCommit, MAIN_REF]).status !== 0) {
    throw new Error('--source-ref is not on the verified origin/main history (git fetch origin main if main has moved)')
  }
  return sourceCommit
}

export function verifyBundleProvenance(sourceRef, bundlePath = defaultBundle, manifestPath = defaultManifest, root = repoRoot) {
  const sourceCommit = resolveSourceCommit(sourceRef, root)
  if (git(root, ['diff', '--quiet', '--no-ext-diff', sourceCommit, '--', ...siteInputs]).status !== 0) {
    throw new Error('Token source files differ from --source-ref; rebuild from a matching checkout')
  }
  // Test scripts may change after the site's source commit. Dependency and
  // runtime fields may not: they determine how the CSS and component bundle build.
  const packageAtCommit = JSON.parse(gitText(root, ['show', `${sourceCommit}:package.json`]))
  const packageNow = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  if (!packageBuildFields.every((field) => isDeepStrictEqual(packageAtCommit[field], packageNow[field]))) {
    throw new Error('Package build inputs differ from --source-ref; use the current main commit')
  }

  // sourceInputDigest() rejects untracked inputs; bundleInputs already covers siteInputs.
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (manifest.format !== 1 || manifest.sourceInputsSha256 !== sourceInputDigest(root)) {
    throw new Error('Design-sync bundle source manifest is stale; run npm run design-sync without --skip-build')
  }
  const bundleCssSha256 = cssDigest(bundlePath)
  if (manifest.bundleCssSha256 !== bundleCssSha256) {
    throw new Error('Design-sync CSS differs from its build manifest; run npm run design-sync without --skip-build')
  }
  return {
    sourceCommit,
    commitDate: gitText(root, ['show', '-s', '--format=%cs', sourceCommit]),
    bundleCssSha256,
    sourceInputsSha256: manifest.sourceInputsSha256,
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { positionals: [command, sourceRef], values } = parseArgs({
      allowPositionals: true,
      options: { bundle: { type: 'string' }, manifest: { type: 'string' }, root: { type: 'string' } },
    })
    if (command !== 'verify') {
      throw new Error('Usage: node source-provenance.mjs verify main@<commit> [--bundle css] [--manifest json] [--root dir]')
    }
    console.log(JSON.stringify(verifyBundleProvenance(sourceRef, values.bundle, values.manifest, values.root)))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 2
  }
}
