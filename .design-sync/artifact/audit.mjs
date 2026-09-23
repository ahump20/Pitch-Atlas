// Interaction audit over the packaged previews (the render-check HTML in shots9):
// every interactive element's box at 900 and 390 wide, a Tab walk with the
// focus indicator each stop draws, and the ARIA each control exposes.
import { createRequire } from 'node:module'
import { writeFileSync } from 'node:fs'
// Run from anywhere: paths resolve from this file (.design-sync/artifact/ in the repo).
const REPO_ROOT = decodeURIComponent(new URL('../..', import.meta.url).pathname).replace(/\/$/, '')
const require = createRequire(`${REPO_ROOT}/.ds-sync/package.json`)
const { chromium } = require('playwright')
const DIR = process.argv[2]
const names = process.argv[3].split(',')
const browser = await chromium.launch()
const out = {}
const SEL = 'button, a[href], input, select, textarea, [role=button], [role=combobox], [role=option], [role=tab], [role=radio], [role=checkbox], [role=slider], [tabindex]:not([tabindex="-1"])'
for (const width of [900, 390]) {
  for (const name of names) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    await page.goto(`file://${DIR}/${name}.html`)
    await page.waitForTimeout(1200)
    const els = await page.evaluate((SEL) => [...document.querySelectorAll(SEL)].map((e) => {
      const r = e.getBoundingClientRect()
      return { tag: e.tagName.toLowerCase(), role: e.getAttribute('role'), label: e.getAttribute('aria-label'),
        text: (e.innerText || e.value || e.getAttribute('placeholder') || '').trim().slice(0, 28),
        w: Math.round(r.width), h: Math.round(r.height), pressed: e.getAttribute('aria-pressed'), checked: e.getAttribute('aria-checked'),
        selected: e.getAttribute('aria-selected'), expanded: e.getAttribute('aria-expanded'),
        ariaHidden: !!e.closest('[aria-hidden="true"]'), disabled: !!e.disabled, visible: r.width > 0 && r.height > 0 }
    }), SEL)
    const stops = []
    if (width === 900) {
      await page.mouse.click(2, 2)
      for (let i = 0; i < 14; i++) {
        await page.keyboard.press('Tab')
        const s = await page.evaluate(() => {
          const e = document.activeElement
          if (!e || e === document.body) return null
          const cs = getComputedStyle(e)
          const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ? `outline ${cs.outlineWidth} ${cs.outlineColor}` : (cs.boxShadow !== 'none' ? `shadow ${cs.boxShadow.slice(0, 60)}` : 'NONE')
          return { tag: e.tagName.toLowerCase(), role: e.getAttribute('role'), name: (e.getAttribute('aria-label') || e.innerText || e.getAttribute('placeholder') || '').trim().slice(0, 28), ring, fv: e.matches(':focus-visible') }
        })
        stops.push(s)
        if (!s) break
      }
    }
    const live = await page.evaluate(() => [...document.querySelectorAll('[aria-live],[role=status],[role=alert],[role=region]')].map((e) => `${e.tagName.toLowerCase()} ${e.getAttribute('role') || ''} live=${e.getAttribute('aria-live')} label=${e.getAttribute('aria-label')}`))
    ;(out[name] ||= {})[width] = { els, stops, live }
    await page.close()
  }
}
await browser.close()
writeFileSync(`${DIR}/audit.json`, JSON.stringify(out, null, 1))
for (const [n, v] of Object.entries(out)) {
  console.log(`\n== ${n}`)
  for (const w of [900, 390]) {
    const small = v[w].els.filter((e) => e.visible && !e.ariaHidden && (e.w < 44 || e.h < 44)).map((e) => `${e.tag}${e.role ? '/' + e.role : ''} "${e.label || e.text}" ${e.w}x${e.h}`)
    console.log(`  ${w}px: ${v[w].els.filter((e) => e.visible).length} interactive; under 44: ${small.length ? small.join(' | ') : 'none'}`)
  }
  const aria = v[900].els.filter((e) => e.visible).map((e) => `${e.tag}${e.role ? '/' + e.role : ''}${e.pressed != null ? ' pressed=' + e.pressed : ''}${e.checked != null ? ' checked=' + e.checked : ''}${e.selected != null ? ' selected=' + e.selected : ''}${e.expanded != null ? ' expanded=' + e.expanded : ''}${e.ariaHidden ? ' (aria-hidden)' : ''}`)
  console.log('  aria:', [...new Set(aria)].join(' ; '))
  console.log('  tab:', v[900].stops.map((s) => s ? `${s.tag}${s.role ? '/' + s.role : ''} "${s.name}" [${s.ring}${s.fv ? '' : ' !fv'}]` : 'END').join(' → '))
  if (v[900].live.length) console.log('  live:', v[900].live.join(' ; '))
}
