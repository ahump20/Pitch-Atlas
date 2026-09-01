import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { GRIP_AUDIO_CUES } from './grip-cues'

function publicFile(src: string): string {
  return join(process.cwd(), 'public', src.replace(/^\//, ''))
}

describe('grip narration cues', () => {
  it('ships the four approved short cues in one locked voice', () => {
    expect(GRIP_AUDIO_CUES.map((cue) => cue.pitchSlug)).toEqual([
      'four-seam',
      'two-seam',
      'twelve-six',
      'three-finger-change',
    ])
    expect(new Set(GRIP_AUDIO_CUES.map((cue) => cue.voice))).toEqual(new Set(['Nathan Enhanced']))
  })

  for (const cue of GRIP_AUDIO_CUES) {
    it(`${cue.pitchSlug} has an accessible transcript and budgeted audio`, () => {
      expect(cue.transcript.length).toBeGreaterThan(40)
      expect(cue.durationSeconds).toBeGreaterThanOrEqual(8)
      expect(cue.durationSeconds).toBeLessThanOrEqual(12)
      expect(cue.audioSrc).toMatch(/-[a-f0-9]{8}\.m4a$/)
      expect(cue.captionsSrc).toMatch(/-[a-f0-9]{8}\.vtt$/)
      expect(existsSync(publicFile(cue.audioSrc))).toBe(true)
      expect(existsSync(publicFile(cue.captionsSrc))).toBe(true)
      expect(statSync(publicFile(cue.audioSrc)).size).toBeLessThanOrEqual(250_000)
      expect(cue.transcript).not.toMatch(/injur|workload|youth|medical/i)
    })
  }
})

