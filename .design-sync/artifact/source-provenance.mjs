// Bind a design-sync CSS bundle to the source tree that produced it. The
// repository's build wrapper writes this ignored manifest only after a full
// app build and a successful design-sync run; --skip-build preserves it.
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDeepStrictEqual } from 'node:util'

export const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
export const defaultBundle = join(repoRoot, 'ds-bundle/_ds_bundle.css')
export const defaultManifest = join(repoRoot, 'ds-bundle/.source-provenance.json')

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

function git(args) {
  return spawnSync('git', ['-C', repoRoot, ...args], { encoding: null })
}

function gitText(args) {
  const result = git(args)
  if (result.status !== 0) throw new Error(result.stderr.toString('utf8').trim() || `git ${args[0]} failed`)
  return result.stdout.toString('utf8').trim()
}

function gitPaths(args) {
  const result = git([...args.slice(0, 1), '-z', ...args.slice(1)])
  if (result.status !== 0) throw new Error(result.stderr.toString('utf8').trim() || `git ${args[0]} failed`)
  return result.stdout.toString('utf8').split('\0').filter(Boolean)
}

function trackedInputs() {
  const untracked = gitPaths(['ls-files', '--others', '--exclude-standard', '--', ...bundleInputs])
  if (untracked.length) throw new Error(`Untracked design-sync source input: ${untracked[0]}`)
  return gitPaths(['ls-files', '--', ...bundleInputs]).sort()
}

export function sourceInputDigest() {
  const hash = createHash('sha256')
  for (const relative of trackedInputs()) {
    const bytes = readFileSync(join(repoRoot, relative))
    hash.update(relative).update('\0').update(String(bytes.length)).update('\0').update(bytes)
  }
  return hash.digest('hex')
}

function cssDigest(bundlePath) {
  return createHash('sha256').update(readFileSync(bundlePath)).digest('hex')
}

export function recordBundleProvenance(bundlePath = defaultBundle, manifestPath = defaultManifest) {
  const manifest = {
    format: 1,
    sourceInputsSha256: sourceInputDigest(),
    bundleCssSha256: cssDigest(bundlePath),
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}

export function verifyBundleProvenance(sourceRef, bundlePath = defaultBundle, manifestPath = defaultManifest) {
  if (!/^main@[0-9a-f]{7,40}$/.test(sourceRef)) throw new Error('--source-ref must be main@<commit>')
  const shortSha = sourceRef.slice('main@'.length)
  let sourceCommit
  try {
    sourceCommit = gitText(['rev-parse', '--verify', `${shortSha}^{commit}`])
  } catch {
    throw new Error('Source ref does not resolve to the stated commit in this repository')
  }
  if (!sourceCommit.startsWith(shortSha)) throw new Error('Source ref does not resolve to the stated commit')

  const mainRef = 'refs/remotes/origin/main'
  if (git(['rev-parse', '--verify', '--quiet', `${mainRef}^{commit}`]).status !== 0 ||
      git(['merge-base', '--is-ancestor', sourceCommit, mainRef]).status !== 0) {
    throw new Error('--source-ref is not on the verified origin/main history')
  }
  if (git(['diff', '--quiet', '--no-ext-diff', sourceCommit, '--', ...siteInputs]).status !== 0) {
    throw new Error('Token source files differ from --source-ref; rebuild from a matching checkout')
  }
  // Test scripts may change after the site's source commit. Dependency and
  // runtime fields may not: they determine how the CSS and component bundle build.
  const packageAtCommit = JSON.parse(gitText(['show', `${sourceCommit}:package.json`]))
  const packageNow = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'))
  if (!packageBuildFields.every((field) => isDeepStrictEqual(packageAtCommit[field], packageNow[field]))) {
    throw new Error('Package build inputs differ from --source-ref; use the current main commit')
  }

  // sourceInputDigest() rejects untracked inputs; bundleInputs already covers siteInputs.
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (manifest.format !== 1 || manifest.sourceInputsSha256 !== sourceInputDigest()) {
    throw new Error('Design-sync bundle source manifest is stale; run npm run design-sync without --skip-build')
  }
  const bundleCssSha256 = cssDigest(bundlePath)
  if (manifest.bundleCssSha256 !== bundleCssSha256) {
    throw new Error('Design-sync CSS differs from its build manifest; run npm run design-sync without --skip-build')
  }
  return { sourceCommit, bundleCssSha256, sourceInputsSha256: manifest.sourceInputsSha256 }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const [command, sourceRef, bundlePath = defaultBundle, manifestPath = defaultManifest] = process.argv.slice(2)
    if (command !== 'verify') throw new Error('Usage: node source-provenance.mjs verify main@<commit> [bundle.css] [manifest.json]')
    console.log(JSON.stringify(verifyBundleProvenance(sourceRef, bundlePath, manifestPath)))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 2
  }
}
