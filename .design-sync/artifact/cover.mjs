// The cover (components/Cover/preview.html), the face above the brand book, built
// from the product: identity colours as specimen cards standing in the case (the
// home is the Refractor Case), and one pattern, the ball's own seam, projected by
// the seamPoint that draws the 3D tube and the schematic. The name is the system's
// title; the tagline is the site's own (src/config/site.ts). Nothing hand-drawn.
// Usage: node .design-sync/artifact/cover.mjs <…/ds-artifact/project>
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const REPO = decodeURIComponent(new URL('../..', import.meta.url).pathname).replace(/\/$/, '')
const esbuild = createRequire(`${REPO}/.ds-sync/package.json`)('esbuild')
const OUT = process.argv[2]
const load = (entry) => import('data:text/javascript;base64,' + Buffer.from(
  esbuild.buildSync({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', write: false }).outputFiles[0].text,
).toString('base64'))
const { projectSeam, splitRuns, buildLacing } = await load(`${REPO}/src/lib/seam2d.ts`)
const { SITE } = await load(`${REPO}/src/config/site.ts`)
const title = JSON.parse(readFileSync(join(OUT, 'design-system.json'), 'utf8')).title

// Two lines, split at the space that keeps the longer line shortest.
const words = title.split(' ')
const lines = words.slice(1).map((_, i) => [words.slice(0, i + 1).join(' '), words.slice(i + 1).join(' ')])
  .sort((a, b) => Math.max(...a.map((l) => l.length)) - Math.max(...b.map((l) => l.length)))[0]

// Cards hang from the top edge and step down to the right, on the 4px `spacing`
// step: x, width and bottom are multiples of it; 16px gaps. Every card shows its
// rounded foot, so the set reads as cards in a case, not as bars or a wall.
const cards = [
  { tone: 'cyan', x: 544, w: 48, bottom: 72 },
  { tone: 'primary', x: 608, w: 80, bottom: 136 },
  { tone: 'cream', x: 704, w: 144, bottom: 200 },
  { tone: 'leather', x: 864, w: 112, bottom: 264 },
]
const cream = cards[2]

// The seam: one ball centred on the cream card, seamPoint turned a quarter about
// the view axis so its two front arcs bow toward each other (the face the brand
// mark draws), sized so every stitch sits whole inside the card; the lacing is the
// schematic's own, scaled from its r=86 draw.
const R = 100
const cx = cream.x + cream.w / 2
const cy = cream.bottom / 2
const points = projectSeam(cx, cy, R, 280, (p) => ({ x: -p.y, y: p.x, z: p.z }))
const k = R / 86
const groove = splitRuns(points).filter((r) => r.front).map((r) => `<path class="groove" d="${r.d}" />`)
const lace = buildLacing(points, 4, 6 * k).filter((s) => s.front)
  .map((s) => `M${s.x1.toFixed(1)} ${s.y1.toFixed(1)}L${s.x2.toFixed(1)} ${s.y2.toFixed(1)}`).join('')

const rects = cards.map((c) => `<rect class="card ${c.tone}" x="${c.x}" y="-16" width="${c.w}" height="${c.bottom + 16}" />`).join('\n    ')
const html = `<!-- @dsCard height=288 -->
<!doctype html>
<html><head><meta charset="utf-8">
<style>
  html, body { margin: 0; background: var(--surface-page); }
  .cover { position: relative; width: 960px; height: 288px; overflow: hidden; background: var(--surface-page); }
  .art { position: absolute; inset: 0; }
  .card { rx: var(--radius-lg); ry: var(--radius-lg); }
  .cyan { fill: var(--color-cyan); }
  .primary { fill: var(--primary); }
  .cream { fill: var(--surface-cream); }
  .leather { fill: var(--color-leather); }
  .groove { fill: none; stroke: var(--color-leather); stroke-width: ${(0.8 * k).toFixed(2)}; stroke-linecap: round; }
  .lace { fill: none; stroke: var(--color-seam-bright); stroke-width: ${(1.1 * k).toFixed(2)}; stroke-linecap: round; }
  .words { position: absolute; left: 40px; bottom: 36px; width: 440px; }
  .name {
    margin: 0; font-family: var(--font-display); font-weight: 400; font-size: 76px; line-height: 0.95;
    letter-spacing: -0.052em; color: var(--text-fg);
  }
  .name span { display: block; }
  .tagline { margin: 16px 0 0; font-family: var(--font-prose); font-size: 14px; line-height: 1.4; color: var(--text-fg-2); }
</style>
</head><body>
<div class="cover">
  <svg class="art" width="960" height="288" viewBox="0 0 960 288" aria-hidden="true">
    <!--
      blocks: color-cyan 48w, primary 80w, surface-cream 144w, color-leather 112w (bleeds off the right); x, widths and bottoms on the 4px spacing step
      arrangement: specimen cards hanging in the case from the top edge, stepping down to the right, 16px gaps, the set the home composes in
      pattern: a literal motif, the ball's seam: seamPoint at r=${R}, turned to the face the brand mark draws, on the cream card, lacing in color-seam-bright over a color-leather groove, because every grip starts on the seam
      steps and radii: spacing 4px (gaps 16, bottoms 72 / 136 / 200 / 264), corners radius-lg, strokes the schematic's own scaled by r/86
    -->
    <defs><clipPath id="cream-card"><rect class="card" x="${cream.x}" y="-16" width="${cream.w}" height="${cream.bottom + 16}" /></clipPath></defs>
    ${rects}
    <g clip-path="url(#cream-card)">
      ${groove.join('\n      ')}
      <path class="lace" d="${lace}" />
    </g>
  </svg>
  <div class="words">
    <h1 class="name">${lines.map((l) => `<span>${l}</span>`).join('')}</h1>
    <p class="tagline">${SITE.tagline}</p>
  </div>
</div>
</body></html>
`
mkdirSync(join(OUT, 'components/Cover'), { recursive: true })
writeFileSync(join(OUT, 'components/Cover/preview.html'), html)
console.log('cover', lines, SITE.tagline, html.length, 'bytes')
