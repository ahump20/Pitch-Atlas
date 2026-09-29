// Effective value of every token at :root, as the site's own stylesheet leaves it
// (no page tokens.css in play), plus per theme class and inside .field-cream.
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
// Run from anywhere: paths resolve from this file (.design-sync/artifact/ in the repo).
const [tokensPath, outputPath, flag, sourceRef] = process.argv.slice(2)
if (process.argv.length !== 6 || !tokensPath || !outputPath || flag !== '--source-ref' || !/^main@[0-9a-f]{7,40}$/.test(sourceRef)) {
  console.error('Usage: node resolve-tokens.mjs <tokens.json> <resolved.json> --source-ref main@<commit>')
  process.exit(2)
}
const REPO_ROOT = decodeURIComponent(new URL('../..', import.meta.url).pathname).replace(/\/$/, '')
const sourceCommit = sourceRef.slice('main@'.length)
const sourceFiles = [
  'src/index.css', 'src/components/sections/family-accent.ts',
  'src/components/refractor/accents.ts', 'src/main.tsx',
  '.design-sync/config.json', 'vite.config.ts', 'package.json', 'package-lock.json',
]
const commit = spawnSync('git', ['-C', REPO_ROOT, 'rev-parse', '--verify', `${sourceCommit}^{commit}`], { encoding: 'utf8' })
if (commit.status !== 0 || !commit.stdout.trim().startsWith(sourceCommit)) {
  console.error('Source ref does not resolve to the stated commit in this repository')
  process.exit(2)
}
const sourceDiff = spawnSync('git', ['-C', REPO_ROOT, 'diff', '--quiet', '--no-ext-diff', commit.stdout.trim(), '--', ...sourceFiles])
if (sourceDiff.status !== 0) {
  console.error('Token source files differ from --source-ref; rebuild from a matching checkout')
  process.exit(2)
}
const require = createRequire(`${REPO_ROOT}/.ds-sync/package.json`)
const { chromium } = require('playwright')
const REPO = REPO_ROOT
const cssBytes = readFileSync(`${REPO}/ds-bundle/_ds_bundle.css`)
const bundleCssSha256 = createHash('sha256').update(cssBytes).digest('hex')
const css = cssBytes.toString('utf8')
const carriedBytes = readFileSync(tokensPath)
const carriedSha256 = createHash('sha256').update(carriedBytes).digest('hex')
const tokens = JSON.parse(carriedBytes.toString('utf8'))
const fams = Object.entries(tokens).filter(([k, v]) => v && Array.isArray(v.tokens)).map(([k, v]) => [k, v.tokens.map((t) => t.name)])
const colorNames = tokens.color.tokens.map((t) => t.name)
const extra = ['color-void','color-bone','color-orange','color-teal','color-teal-bright','color-powder-deep','radius','radius-pill','ember','foil','pa-ease-settle','pa-motion-tiny','pa-motion-short','pa-motion-medium','pa-motion-slow','pa-motion-sweep','font-mono','font-display','font-prose','font-athletic','font-sans']
const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body><div id="p"></div><div class="field-cream"><div id="c"></div></div></body></html>`)
const read = (scope) => page.evaluate(({ fams, colorNames, extra, scope }) => {
  const h = document.documentElement
  h.className = scope && scope !== 'field-cream' ? scope : ''
  if (scope && scope !== 'field-cream') h.setAttribute('data-theme', scope); else h.removeAttribute('data-theme')
  const host = scope === 'field-cream' ? document.getElementById('c') : document.getElementById('p')
  const cs = getComputedStyle(scope === 'field-cream' ? host : h)
  const out = {}
  const names = new Set([...fams.flatMap(([, n]) => n), ...extra])
  for (const n of names) {
    const raw = cs.getPropertyValue('--' + n).trim()
    let color = null
    if (colorNames.includes(n) || n.startsWith('color-')) {
      host.style.color = 'rgb(1, 2, 3)'
      host.style.color = `var(--${n})`
      const c = getComputedStyle(host).color
      color = raw === '' ? null : c
      host.style.color = ''
    }
    out[n] = { raw, color }
  }
  return out
}, { fams, colorNames, extra, scope })
const result = { sourceRef, bundleCssSha256, carriedSha256, default: await read(''), 'field-cream': await read('field-cream') }
for (const t of ['scene-coal', 'rfx-card', 'rfx-plate']) result[t] = await read(t)
await browser.close()
writeFileSync(outputPath, JSON.stringify(result, null, 1))
console.log('resolved', Object.keys(result.default).length, 'names')
