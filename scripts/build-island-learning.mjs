import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
const version = `${packageJson.version}+${sourceCommit.slice(0, 7)}`
const output = path.join(root, 'output', 'island-learning', version)
const declarations = path.join(root, 'output', 'island-learning', '.declarations')

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

const receipt = {
  schemaVersion: 1,
  artifact: '@pitch-atlas/island-learning',
  version,
  sourceRepository: artifactPackage.pitchAtlas.sourceRepository,
  sourceCommit,
  maintainedBy: artifactPackage.pitchAtlas.maintainedBy,
  generatedAt: new Date().toISOString(),
  files: {
    'index.js': await sha256('index.js'),
    'index.js.map': await sha256('index.js.map'),
    'index.d.ts': await sha256('index.d.ts'),
    'index.d.ts.map': await sha256('index.d.ts.map'),
    'package.json': await sha256('package.json'),
  },
}
await writeFile(path.join(output, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
await rm(declarations, { recursive: true, force: true })
process.stdout.write(`${output}\n`)
