import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { cardLayout } from './cardLayout'

/*
  The export paints the card from the same measures the page prints it with. The
  source chip is the one the page and the file both set inside the window's corner,
  where the bezel curves: it sits 3.5 card units in from the window's left and bottom
  edges on both, so it clears the bezel at every size and the saved card matches.
*/

const css = readFileSync(resolve(__dirname, '../../../index.css'), 'utf8')

function cssChipInset(side: 'left' | 'bottom'): number {
  // the rule that places the chip (another one only animates it)
  const rule = [...css.matchAll(/\.rfx-gripchip \{[^}]*\}/g)].map((m) => m[0]).find((r) => r.includes('position: absolute')) ?? ''
  const value = rule.match(new RegExp(`${side}: calc\\(var\\(--rfxu\\) \\* ([\\d.]+)\\)`))?.[1]
  if (!value) throw new Error(`no ${side} inset in the .rfx-gripchip rule`)
  return Number(value)
}

describe('cardLayout', () => {
  it('sets the source chip inside the window where the page sets it, clear of the bezel', () => {
    const l = cardLayout({ width: 1500, gold: false })
    const left = (l.chip.x - l.window.x) / l.u
    const bottom = (l.window.y + l.window.h - (l.chip.y + l.chip.h)) / l.u
    expect(left).toBeCloseTo(3.5, 9)
    expect(bottom).toBeCloseTo(3.5, 9)
    expect(cssChipInset('left')).toBe(3.5)
    expect(cssChipInset('bottom')).toBe(3.5)
  })
})
