import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const RETIRED_SLOGAN = /sourced[—,]?\s+not\s+corrected/i

const GOVERNING_AND_PUBLIC_FILES = [
  'README.md',
  'AGENTS.md',
  'CLAUDE.md',
  'docs/NORTHSTAR.md',
  'docs/PLATFORM-CONTRACT.md',
  'package.json',
  'public/llms.txt',
  'public/robots.txt',
  'public/site.webmanifest',
  'src/config/site.ts',
  'src/pages/SourcesPage.tsx',
  'src/components/v2/ProvenanceStrip.tsx',
  'src/components/v2/CloseCta.tsx',
] as const

const TEXT_EXTENSIONS = /\.(?:md|ts|tsx|json|txt|webmanifest|sql|toml)$/

function textFilesUnder(root: string): string[] {
  const files: string[] = []
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (TEXT_EXTENSIONS.test(entry.name)) files.push(path)
    }
  }
  walk(join(process.cwd(), root))
  return files
}

describe('Pitch Atlas mission contract', () => {
  it('keeps the retired sourcing slogan out of governing documents and public copy', () => {
    const governing = GOVERNING_AND_PUBLIC_FILES.map((file) => join(process.cwd(), file))
    const candidates = new Set([
      ...governing,
      ...textFilesUnder('docs'),
      ...textFilesUnder('src'),
      ...textFilesUnder('public'),
      ...textFilesUnder('supabase'),
      ...textFilesUnder('workers'),
    ])
    const offenders = [...candidates]
      .filter((file) => RETIRED_SLOGAN.test(readFileSync(file, 'utf8')))
      .map((file) => file.replace(`${process.cwd()}/`, ''))
    expect(offenders).toEqual([])
  })

  it('keeps the living-museum mission and source trust infrastructure together', () => {
    const site = readFileSync(join(process.cwd(), 'src/config/site.ts'), 'utf8')
    const types = readFileSync(join(process.cwd(), 'src/data/types.ts'), 'utf8')
    const sources = readFileSync(join(process.cwd(), 'src/data/sources.ts'), 'utf8')

    expect(site).toContain('preserves the heritage, history, and art of pitching')
    expect(types).toContain('export type ClaimConfidence')
    expect(types).toContain('export interface Source')
    expect(sources).toContain('export function claim')
  })
})
