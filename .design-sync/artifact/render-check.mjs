// Render every packaged preview the way the page's frame does: tokens.css
// compiled from tokens.json, bundle.css, the listed libraries and bundle.js
// preloaded, <html data-theme="default" class="default">. Measures height and
// screenshots each; fails on any page error or empty root.
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
// Run from anywhere: paths resolve from this file (.design-sync/artifact/ in the repo).
const REPO_ROOT = decodeURIComponent(new URL('../..', import.meta.url).pathname).replace(/\/$/, '')
const require = createRequire(`${REPO_ROOT}/.ds-sync/package.json`)
const { chromium } = require('playwright')
const ROOT = process.argv[2]                    // …/ds-artifact/project
const TOKENS = JSON.parse(readFileSync(process.argv[3], 'utf8'))
const SHOTS = process.argv[4]
const only = process.argv[5] ? process.argv[5].split(',') : null
mkdirSync(SHOTS, { recursive: true })
const FONTDIR = `${REPO_ROOT}/node_modules/@fontsource`

function tokensCss(t) {
  const first = t.color.themes[0].id
  const v = (x) => (typeof x === 'string' && x.startsWith('{') ? `var(--${x.slice(1, -1)})` : typeof x === 'object' ? v(x[first]) : x)
  const L = [`:root, [data-theme="${first}"] {`]
  for (const c of t.color.tokens) L.push(`  --${c.name}: ${v(c.value)};`)
  L.push('}', ':root {')
  for (const [k, fam] of Object.entries(t)) if (k !== 'color' && fam && Array.isArray(fam.tokens)) for (const x of fam.tokens) L.push(`  --${x.name}: ${x.value};`)
  for (const [k, s] of Object.entries(t.type.families)) L.push(`  --font-${k}: ${s};`)
  L.push('}')
  for (const g of t.type.groups) for (const s of g.styles) {
    const fam = s.family || g.family
    L.push(`.${s.name} {${fam ? ` font-family: var(--font-${fam});` : ''} font-size: ${s.fontSize}; line-height: ${s.lineHeight ?? 'normal'}; font-weight: ${s.fontWeight ?? 400}; letter-spacing: ${s.letterSpacing ?? 0}; }`)
  }
  for (const f of t.type.fonts) {
    const file = f.file.replace(/^fonts\//, ''), slug = file.replace(/-latin-.*/, '')
    L.push(`@font-face { font-family: "${f.family}"; src: url("file://${FONTDIR}/${slug}/files/${file}") format("woff2"); font-weight: ${f.weight}; font-style: ${f.style}; font-display: swap; }`)
  }
  return L.join('\n')
}
const pre = `<style>${tokensCss(TOKENS)}</style><style>${readFileSync(join(ROOT, 'components/bundle.css'), 'utf8')}</style>` +
  ['components/lib/react.development.js', 'components/lib/react-dom.development.js', 'components/bundle.js']
    .map((p) => `<script>${readFileSync(join(ROOT, p), 'utf8')}</script>`).join('')
const browser = await chromium.launch(process.env.WEBGL ? { args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] } : {})
const results = {}
const comps = readdirSync(join(ROOT, 'components'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(ROOT, 'components', d.name, 'preview.html')))
  .map((d) => d.name).filter((n) => !only || only.includes(n))
for (const name of comps) {
  const raw = readFileSync(join(ROOT, 'components', name, 'preview.html'), 'utf8')
  const marker = raw.split('\n', 1)[0]
  const vh = { Dialog: 560, Select: 440, Tooltip: 300, Toaster: 300, Cover: 288 }[name] ?? 900
  const doc = raw.slice(marker.length + 1)
    .replace(/<html[^>]*>/i, () => '<html data-theme="default" class="default">')
    .replace(/<head>/i, () => '<head>' + pre)
  const file = join(SHOTS, `${name}.html`)
  writeFileSync(file, doc)
  const page = await browser.newPage({ viewport: { width: name === 'Cover' ? 960 : (+process.env.W || 900), height: vh } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e.message || e)))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto('file://' + file)
  await page.waitForTimeout(2500)
  // The 3D stage keeps its schematic overlay until the scene reports its first frame.
  await page.waitForFunction(() => !document.querySelector('[data-stage-loading]'), null, { timeout: 30000 }).catch(() => {})
  const m = await page.evaluate(() => ({
    h: Math.ceil(document.documentElement.scrollHeight), content: Math.ceil((document.getElementById('root') || document.body).getBoundingClientRect().height),
    empty: (document.getElementById('root') || document.body).innerText.trim().length === 0 && !document.querySelector('svg,canvas,img'),
    errText: document.body.innerText.includes('Preview error'),
    overflowX: document.documentElement.scrollWidth > innerWidth + 1,
    canvases: document.querySelectorAll('canvas').length,
    stageLoading: document.querySelectorAll('[data-stage-loading]').length,
    primary: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
    cyan: getComputedStyle(document.documentElement).getPropertyValue('--color-cyan').trim(),
    paper: getComputedStyle(document.documentElement).getPropertyValue('--color-paper').trim(),
  }))
  await page.screenshot({ path: join(SHOTS, `${name}.png`), fullPage: true })
  results[name] = { marker, ...m, errors: errors.filter((e) => !/Failed to load resource/.test(e)).slice(0, 3) }
  await page.close()
}
await browser.close()
writeFileSync(join(SHOTS, 'results.json'), JSON.stringify(results, null, 1))
for (const [n, r] of Object.entries(results)) console.log(`${n.padEnd(18)} h=${String(r.h).padEnd(5)} content=${String(r.content).padEnd(5)} empty=${r.empty} err=${r.errText} primary=${r.primary} cyan=${r.cyan} paper=${r.paper} overflowX=${r.overflowX} canvases=${r.canvases} loading=${r.stageLoading} ${r.errors.length ? 'ERRORS ' + JSON.stringify(r.errors) : ''}`)
