import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PRESENTATION_MEDIA } from './presentation'

const HASHED_FILE = /-[a-f0-9]{8}\.(?:avif|webp|jpe?g)$/

function publicFile(src: string): string {
  return join(process.cwd(), 'public', src.replace(/^\//, ''))
}

describe('presentation media provenance and budgets', () => {
  const assets = Object.values(PRESENTATION_MEDIA)

  it('keeps every declared asset presentation-only', () => {
    expect(assets.length).toBeGreaterThan(0)
    expect(assets.every((asset) => asset.evidenceUse === 'presentation-only')).toBe(true)
  })

  for (const asset of assets) {
    describe(asset.id, () => {
      it('points to real declared variants and matches their byte receipts', () => {
        for (const variant of Object.values(asset.variants)) {
          const path = publicFile(variant.src)
          expect(existsSync(path), `${variant.src} should exist`).toBe(true)
          expect(statSync(path).size).toBe(variant.bytes)
        }
      })

      it('stays inside the per-route image budgets', () => {
        expect(asset.variants.mobile.bytes).toBeLessThanOrEqual(120_000)
        expect(asset.variants.desktop.bytes).toBeLessThanOrEqual(250_000)
      })

      it('makes third-party and generated derivatives immutable by filename', () => {
        if (asset.origin === 'first-party') return
        expect(asset.variants.mobile.src).toMatch(HASHED_FILE)
        expect(asset.variants.desktop.src).toMatch(HASHED_FILE)
      })

      it('carries complete origin metadata', () => {
        if (asset.origin === 'unsplash') {
          expect(asset.rights).toBe('licensed')
          expect(asset.credit.sourceUrl).toMatch(/^https:\/\/unsplash\.com\/photos\//)
          expect(asset.credit.licenseUrl).toBe('https://unsplash.com/license')
        }
        if (asset.origin === 'generated') {
          expect(asset.rights).toBe('original')
          expect(asset.generated?.provider).toBeTruthy()
          expect(asset.generated?.model).toBeTruthy()
          expect(asset.generated?.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
          expect(asset.generated?.promptSummary.length).toBeGreaterThan(40)
        }
      })
    })
  }

  it('declares every file in public/presentation so undeclared media cannot drift in', () => {
    const declared = new Set(
      assets.flatMap((asset) =>
        Object.values(asset.variants)
          .map((variant) => variant.src.replace(/^\//, ''))
          .filter((path) => path.startsWith('presentation/')),
      ),
    )
    const onDisk = readdirSync(join(process.cwd(), 'public/presentation')).map((file) => `presentation/${file}`)
    expect(new Set(onDisk)).toEqual(declared)
  })
})
