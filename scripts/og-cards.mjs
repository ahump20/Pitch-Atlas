#!/usr/bin/env node
/*
  One-shot OG share-card generator. Renders an original, on-brand 1200x630 card
  per section to public/og/<section>.png. Nothing here is licensed or scraped:
  the cards are drawn from elements the atlas already owns — the Anton wordmark
  (the project's own OFL @fontsource face, served from public/brand), the
  heritage palette, the baseball-seam motif, and the standing "Sourced, not
  corrected" principle. No pitch-behavior number ever appears on a card (the
  doctrine holds for share art too).

  Engine: headless Chromium via playwright-core (already installed for the test
  suite — no new npm dependency, so the shared build is untouched). Chromium
  honors @font-face, so the wordmark paints in real Anton; rsvg/librsvg on macOS
  renders text through Core Text and substitutes the face, which is why this
  uses a real browser instead. Each card is one HTML page, screenshotted to PNG.
  PNG, not webp: some social scrapers reject webp.

  Run: node scripts/og-cards.mjs
*/
import { mkdirSync, existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { chromium } from 'playwright-core'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'public', 'og')
const FONT_PATH = path.join(ROOT, 'public', 'brand', 'anton-latin-400.woff2')

const W = 1200
const H = 630

// Heritage palette (mirrors src/index.css @theme).
const C = {
  stage: '#16120D', // near-black field
  press: '#221E18', // raised charcoal
  bone: '#F2ECDD', // cream text on the field
  bone2: '#C7BEA8', // secondary cream
  seam: '#C8102E', // battle red — the seam / accent
  powder: '#6CACE4', // columbia blue
  navy: '#15406E',
  teal: '#00A2A0',
  cyan: '#37D6FF', // the softball wing's accent (the circle)
  sand: '#8A7A5E',
}

// Each section: the eyebrow label, the big line (the card's read), the sub, and
// the accent. All copy is real site copy; no invented figure ever appears.
const SECTIONS = [
  {
    name: 'home',
    eyebrow: 'The living field manual',
    line: 'Pitch Atlas',
    sub: 'Every pitch, gripped and sourced.',
    accent: C.seam,
  },
  {
    name: 'repertoire',
    eyebrow: 'The Pitch Index',
    line: 'Every pitch, by family',
    sub: 'A sourced one-liner for every accepted pitch. Open any file.',
    accent: C.powder,
  },
  {
    name: 'craftsmen',
    eyebrow: 'The Craftsmen',
    line: 'The arms that defined the pitches',
    sub: 'Gibson to Skenes, and the mental edge behind each one.',
    accent: C.navy,
  },
  {
    name: 'lost-pitches',
    eyebrow: 'Lost Pitches of the Negro Leagues',
    line: 'The pitches the record cannot hold',
    sub: 'Filed by how well they survive. The grip rarely does.',
    accent: C.seam,
  },
  {
    name: 'grips',
    eyebrow: 'The Grip Library',
    line: 'Real grips, in the hand',
    sub: 'The part a hitter never gets to see.',
    accent: C.teal,
  },
  {
    name: 'learn',
    eyebrow: 'Learn',
    line: 'The craft underneath the pitch',
    sub: 'Mechanics, design, sequencing, spin, arm health.',
    accent: C.powder,
  },
  {
    name: 'softball',
    eyebrow: 'The Circle',
    line: 'Softball enters the atlas',
    sub: 'The underhand windmill and the riseball physics, anchored on Cat Osterman.',
    accent: C.cyan,
  },
]

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/* The baseball-seam arc, drawn as inline SVG in the corner — two facing stitch
   rows, the atlas's mark. A texture at low opacity, not a logo lockup. */
function seamMotifSvg(accent) {
  const arcs = [
    { cx: 1080, cy: 470, r: 230, a0: -1.35, a1: 1.05, flip: 1 },
    { cx: 1340, cy: 470, r: 230, a0: 1.79, a1: 4.19, flip: -1 },
  ]
  const stitches = []
  for (const arc of arcs) {
    const steps = 18
    for (let i = 0; i <= steps; i++) {
      const t = arc.a0 + ((arc.a1 - arc.a0) * i) / steps
      const x = arc.cx + Math.cos(t) * arc.r
      const y = arc.cy + Math.sin(t) * arc.r
      const nx = Math.cos(t + Math.PI / 2) * 13 * arc.flip
      const ny = Math.sin(t + Math.PI / 2) * 13 * arc.flip
      stitches.push(
        `<line x1="${(x - nx).toFixed(1)}" y1="${(y - ny).toFixed(1)}" x2="${(x + nx).toFixed(1)}" y2="${(y + ny).toFixed(1)}" stroke="${accent}" stroke-width="4" stroke-linecap="round" />`,
      )
    }
  }
  const rules = Array.from(
    { length: 18 },
    (_, i) => `<line x1="0" y1="${i * 36 + 12}" x2="${W}" y2="${i * 36 + 12}" stroke="${C.bone}" stroke-width="1" />`,
  ).join('')
  return `
    <svg class="art" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.06">${rules}</g>
      <g opacity="0.5">${stitches.join('')}</g>
    </svg>`
}

function cardHtml(section, fontDataUri) {
  const { eyebrow, line, sub, accent } = section
  return `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  @font-face {
    font-family: 'Anton';
    font-style: normal;
    font-weight: 400;
    font-display: block;
    src: url('${fontDataUri}') format('woff2');
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${W}px; height: ${H}px; }
  .card {
    position: relative; width: ${W}px; height: ${H}px; overflow: hidden;
    background: linear-gradient(135deg, ${C.stage} 0%, ${C.press} 100%);
  }
  .art { position: absolute; inset: 0; }
  .bar { position: absolute; left: 0; top: 0; width: 14px; height: 100%; background: ${accent}; }
  .content { position: absolute; inset: 0; padding: 96px 80px; display: flex; flex-direction: column; }
  .eyebrow {
    font-family: 'Anton', sans-serif; color: ${accent}; text-transform: uppercase;
    letter-spacing: 3px; font-size: 34px; line-height: 1;
  }
  .line {
    font-family: 'Anton', sans-serif; color: ${C.bone}; text-transform: uppercase;
    font-size: 108px; line-height: 0.95; letter-spacing: 0.5px; margin-top: 40px;
    max-width: 1000px;
  }
  .sub {
    font-family: 'Anton', sans-serif; color: ${C.bone2}; font-size: 30px;
    line-height: 1.15; margin-top: 32px; max-width: 880px; letter-spacing: 0.3px;
  }
  .stamp {
    position: absolute; left: 80px; bottom: 56px;
    font-family: 'Anton', sans-serif; color: ${C.sand}; text-transform: uppercase;
    letter-spacing: 2px; font-size: 22px;
  }
</style></head>
<body>
  <div class="card">
    ${seamMotifSvg(accent)}
    <div class="bar"></div>
    <div class="content">
      <div class="eyebrow">${esc(eyebrow)}</div>
      <div class="line">${esc(line)}</div>
      <div class="sub">${esc(sub)}</div>
    </div>
    <div class="stamp">Sourced, not corrected · pitch-atlas.com</div>
  </div>
</body></html>`
}

async function main() {
  if (!existsSync(FONT_PATH)) {
    console.error(`Missing font: ${FONT_PATH}`)
    process.exit(1)
  }
  mkdirSync(OUT_DIR, { recursive: true })

  const fontDataUri = `data:font/woff2;base64,${readFileSync(FONT_PATH).toString('base64')}`

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({
      viewport: { width: W, height: H },
      deviceScaleFactor: 1,
    })
    for (const section of SECTIONS) {
      await page.setContent(cardHtml(section, fontDataUri), { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      const outFile = path.join(OUT_DIR, `${section.name}.png`)
      await page.screenshot({ path: outFile, clip: { x: 0, y: 0, width: W, height: H } })
      console.log(`wrote ${path.relative(ROOT, outFile)}`)
    }
  } finally {
    await browser.close()
  }
  console.log(`\nDone — ${SECTIONS.length} cards in ${path.relative(ROOT, OUT_DIR)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
