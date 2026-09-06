import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
const sourcePaths = [
  'package.json',
  'scripts/build-island-learning.mjs',
  'src/island-learning',
  'src/data/pitches',
  'src/data/grips/index.ts',
  'src/data/sources.ts',
  'src/data/types.ts',
  'src/components/compare/selection.ts',
  'src/lib/seam.ts',
  'src/lib/seam2d.ts',
  'tsconfig.json',
  'tsconfig.island-learning.json',
  'vite.config.island-learning.ts',
]
const sourceStatus = () => execFileSync(
  'git',
  ['status', '--porcelain=v1', '--untracked-files=all', '--', ...sourcePaths],
  { cwd: root, encoding: 'utf8' },
).trim()
const initialStatus = sourceStatus()
if (initialStatus) {
  throw new Error(`Island learning source inputs must match committed HEAD:\n${initialStatus}`)
}
const sourceFiles = execFileSync('git', ['ls-files', '--', ...sourcePaths], { cwd: root, encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)
  .sort()
for (const file of sourceFiles) {
  const headBlob = execFileSync('git', ['rev-parse', `HEAD:${file}`], { cwd: root, encoding: 'utf8' }).trim()
  const workingBlob = execFileSync('git', ['hash-object', file], { cwd: root, encoding: 'utf8' }).trim()
  if (headBlob !== workingBlob) throw new Error(`${file} does not match ${sourceCommit}`)
}
const version = `${packageJson.version}+${sourceCommit.slice(0, 7)}`
const output = path.join(root, 'output', 'island-learning', version)
const declarations = path.join(root, 'output', 'island-learning', '.declarations')
const walkFiles = async (directory, prefix = '') => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const relative = path.posix.join(prefix, entry.name)
    return entry.isDirectory() ? walkFiles(path.join(directory, entry.name), relative) : [relative]
  }))
  return files.flat().sort()
}

await rm(output, { recursive: true, force: true })
await rm(declarations, { recursive: true, force: true })
await mkdir(output, { recursive: true })

execFileSync(process.execPath, [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'build', '--config', 'vite.config.island-learning.ts'], {
  cwd: root,
  env: { ...process.env, PITCH_ATLAS_ISLAND_OUTPUT: output },
  stdio: 'inherit',
})
execFileSync(process.execPath, [path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', 'tsconfig.island-learning.json'], {
  cwd: root,
  stdio: 'inherit',
})

await cp(path.join(declarations, 'island-learning', 'index.d.ts'), path.join(output, 'index.d.ts'))
await cp(path.join(declarations, 'island-learning', 'index.d.ts.map'), path.join(output, 'index.d.ts.map'))
await cp(path.join(declarations, 'data'), path.join(output, 'data'), { recursive: true })
await cp(path.join(declarations, 'lib'), path.join(output, 'lib'), { recursive: true })
await cp(path.join(declarations, 'components'), path.join(output, 'components'), { recursive: true })

const declarationEntry = path.join(output, 'index.d.ts')
const declarationSource = await readFile(declarationEntry, 'utf8')
await writeFile(declarationEntry, declarationSource.replaceAll("from '../", "from './"))

const declarationFiles = (await walkFiles(output)).filter((file) => file.endsWith('.d.ts'))
const declarationSet = new Set(declarationFiles)
for (const file of declarationFiles) {
  const absoluteFile = path.join(output, file)
  const source = await readFile(absoluteFile, 'utf8')
  const rewritten = source.replace(/(from\s+['"])(\.{1,2}\/[^'"]+)(['"])/g, (match, prefix, specifier, suffix) => {
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier))
    if (declarationSet.has(`${target}.d.ts`)) return `${prefix}${specifier}.js${suffix}`
    if (declarationSet.has(`${target}/index.d.ts`)) return `${prefix}${specifier}/index.js${suffix}`
    throw new Error(`Unresolved declaration import in ${file}: ${specifier}`)
  })
  if (rewritten !== source) await writeFile(absoluteFile, rewritten)
}

const sha256 = async (relativePath) => createHash('sha256')
  .update(await readFile(path.join(output, relativePath)))
  .digest('hex')

const artifactPackage = {
  name: '@pitch-atlas/island-learning',
  version,
  private: true,
  type: 'module',
  exports: { '.': { types: './index.d.ts', import: './index.js' } },
  types: './index.d.ts',
  sideEffects: false,
  pitchAtlas: {
    maintainedBy: 'Pitch Atlas',
    sourceRepository: 'https://github.com/ahump20/Pitch-Atlas',
    sourceCommit,
    provenancePolicy: 'Canonical records are exported unchanged with their source, confidence, and rights metadata.',
  },
}
await writeFile(path.join(output, 'package.json'), `${JSON.stringify(artifactPackage, null, 2)}\n`)

if (sourceStatus()) throw new Error('Island learning source inputs changed during the build')
const emittedFiles = (await walkFiles(output)).filter((file) => file !== 'receipt.json')
const fileHashes = Object.fromEntries(
  await Promise.all(emittedFiles.map(async (file) => [file, await sha256(file)])),
)
const sourceHashes = Object.fromEntries(
  await Promise.all(sourceFiles.map(async (file) => [file, createHash('sha256').update(await readFile(path.join(root, file))).digest('hex')])),
)

const receipt = {
  schemaVersion: 1,
  artifact: '@pitch-atlas/island-learning',
  version,
  sourceRepository: artifactPackage.pitchAtlas.sourceRepository,
  sourceCommit,
  maintainedBy: artifactPackage.pitchAtlas.maintainedBy,
  generatedAt: new Date().toISOString(),
  sourceFiles: sourceHashes,
  files: fileHashes,
}
await writeFile(path.join(output, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
const receiptFiles = Object.keys(receipt.files).sort()
const actualFiles = (await walkFiles(output)).filter((file) => file !== 'receipt.json')
if (JSON.stringify(receiptFiles) !== JSON.stringify(actualFiles)) {
  throw new Error('Receipt file set does not match emitted artifact file set')
}
for (const [file, expected] of Object.entries(receipt.files)) {
  if (await sha256(file) !== expected) throw new Error(`Receipt hash mismatch: ${file}`)
}
await rm(declarations, { recursive: true, force: true })
process.stdout.write(`${output}\n`)
