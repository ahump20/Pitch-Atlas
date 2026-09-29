import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import test from 'node:test'

const checker = fileURLToPath(new URL('./render-check.mjs', import.meta.url))
const tokens = { color: { themes: [{ id: 'default' }], tokens: [] }, type: { families: {}, groups: [], fonts: [] } }
const cleanMetrics = {
  h: 900, content: 200, empty: false, errText: false, overflowX: false,
  canvases: 2, stageLoading: 0, primary: '', cyan: '', paper: '',
}

function runPreview(name, { webgl = false, metrics = {}, consoleError = null, fontsReady = true, only = name } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'pitch-atlas-render-check-'))
  try {
    const project = join(dir, 'project')
    const components = join(project, 'components')
    const shots = join(dir, 'shots')
    const tokenFile = join(dir, 'tokens.json')
    const preload = join(dir, 'playwright-mock.cjs')
    mkdirSync(join(components, 'lib'), { recursive: true })
    mkdirSync(join(components, name))
    for (const file of ['bundle.css', 'bundle.js', 'lib/react.development.js', 'lib/react-dom.development.js']) {
      writeFileSync(join(components, file), '')
    }
    writeFileSync(tokenFile, JSON.stringify(tokens))
    writeFileSync(join(components, name, 'preview.html'), '<!-- @dsCard group="test" height=100 -->\n<!doctype html><html><head></head><body><div id="root">Fixture</div></body></html>')
    writeFileSync(preload, `
const Module = require('node:module')
const originalLoad = Module._load
const metrics = ${JSON.stringify({ ...cleanMetrics, ...metrics })}
const consoleError = ${JSON.stringify(consoleError)}
const fontsReady = ${JSON.stringify(fontsReady)}
Module._load = function (request, parent, isMain) {
  if (request === 'playwright') return { chromium: { launch: async () => ({
    newPage: async () => {
      const handlers = {}
      return {
        on: (type, handler) => { handlers[type] = handler },
        goto: async () => {
          if (consoleError) handlers.console({ type: () => 'error', text: () => consoleError })
        },
        waitForTimeout: async () => {},
        waitForFunction: async (predicate) => {
          if (String(predicate).includes('document.fonts')) {
            if (!fontsReady) throw new Error('fixture font timeout')
            return
          }
          if (metrics.stageLoading) throw new Error('fixture timeout')
        },
        evaluate: async () => metrics,
        screenshot: async () => {}, close: async () => {},
      }
    },
    close: async () => {},
  }) } }
  return originalLoad.apply(this, arguments)
}
`)

    const run = spawnSync(process.execPath, ['--require', preload, checker, project, tokenFile, shots, only], {
      encoding: 'utf8',
      timeout: 10000,
      env: { ...process.env, WEBGL: webgl ? '1' : '' },
    })
    const results = JSON.parse(readFileSync(join(shots, 'results.json'), 'utf8'))
    assert.equal(run.error, undefined, run.error?.message)
    return { ...run, results }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

test('fallback BallStage can have no canvas; overflow remains diagnostic', () => {
  const run = runPreview('BallStage', { metrics: { canvases: 0, overflowX: true } })
  assert.equal(run.status, 0, run.stderr)
  assert.equal(run.results.BallStage.canvases, 0)
  assert.equal(run.results.BallStage.overflowX, true)
})

test('WebGL BallStage exits nonzero when canvas count is wrong after writing results', () => {
  const run = runPreview('BallStage', { webgl: true, metrics: { canvases: 1 } })
  assert.equal(run.status, 1, run.stderr)
  assert.equal(run.results.BallStage.canvases, 1)
  assert.match(run.stderr, /BallStage: expected 2 canvases, found 1/)
})

test('page errors, an empty root, and preview error text exit nonzero', () => {
  const run = runPreview('Broken', { metrics: { empty: true, errText: true }, consoleError: 'fixture failure' })
  assert.equal(run.status, 1, run.stderr)
  assert.equal(run.results.Broken.empty, true)
  assert.equal(run.results.Broken.errText, true)
  assert.deepEqual(run.results.Broken.errors, ['fixture failure'])
  assert.match(run.stderr, /Broken: 1 page\/console error\(s\)/)
  assert.match(run.stderr, /Broken: empty preview root/)
  assert.match(run.stderr, /Broken: preview rendered an error message/)
})

test('WebGL BallStage exits nonzero if the loading marker never clears', () => {
  const run = runPreview('BallStage', { webgl: true, metrics: { stageLoading: 1 } })
  assert.equal(run.status, 1, run.stderr)
  assert.equal(run.results.BallStage.stageLoading, 1)
  assert.match(run.stderr, /BallStage: expected loading=0, found 1/)
})

test('an unmatched preview filter cannot report success', () => {
  const run = runPreview('BallStage', { only: 'Missing' })
  assert.equal(run.status, 1, run.stderr)
  assert.deepEqual(run.results, {})
  assert.match(run.stderr, /no matching component previews found/)
})

test('a partially unmatched preview filter cannot report success', () => {
  const run = runPreview('BallStage', { only: 'BallStage,Missing' })
  assert.equal(run.status, 1, run.stderr)
  assert.ok(run.results.BallStage)
  assert.match(run.stderr, /requested component preview not found: Missing/)
})

test('font readiness timeout writes diagnostics and fails the gate', () => {
  const run = runPreview('Card', { fontsReady: false })
  assert.equal(run.status, 1, run.stderr)
  assert.deepEqual(run.results.Card.errors, ['fonts did not finish loading before screenshot'])
  assert.match(run.stderr, /Card: 1 page\/console error\(s\)/)
})
