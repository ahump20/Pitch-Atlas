import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const IMAGE_FILE = /\.(?:avif|webp|png|jpe?g)$/i
const MAX_IMAGE_BYTES = 250_000
const MAX_CACHED_IMAGES = 48

function imageFiles(root: string): string[] {
  const files: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (IMAGE_FILE.test(entry.name)) files.push(path)
    }
  }
  walk(root)
  return files
}

describe('PWA media cache budget', () => {
  it('keeps every cache-eligible image at or below 250 KB', () => {
    const offenders = imageFiles(join(process.cwd(), 'public'))
      .filter((path) => statSync(path).size > MAX_IMAGE_BYTES)
      .map((path) => ({ path, bytes: statSync(path).size }))
    expect(offenders).toEqual([])
  })

  it('bounds the image cache at 12 MB while leaving audio and video network-only', () => {
    expect(MAX_IMAGE_BYTES * MAX_CACHED_IMAGES).toBe(12_000_000)
    const config = readFileSync(join(process.cwd(), 'vite.config.ts'), 'utf8')
    expect(config).toContain('maxEntries: 48')
    expect(config).toContain("request.destination === 'image'")
    expect(config).not.toContain("request.destination === 'audio'")
    expect(config).not.toContain("request.destination === 'video'")
  })
})
