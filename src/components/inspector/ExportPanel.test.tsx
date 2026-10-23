import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { pitchBySlug } from '../../data/pitches'
import type { TiltEngine } from '../../hooks/useCardTilt'
import { PRESETS } from '../refractor/material/materialPresets'
import { ExportPanel } from './ExportPanel'

/*
  The export panel says what an export costs before the click and what it made after:
  the loop's time up front, the file's size when it lands. The painters are stood in
  here (their pixels are pinned in their own tests); a file of a known size comes back.
*/

const png = vi.hoisted(() => ({ size: 1_520_000 }))
vi.mock('./export/exportPng', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./export/exportPng')>()),
  exportSpecimenPng: async () => ({ size: png.size, type: 'image/png' }) as Blob,
  downloadBlob: () => undefined,
}))

// which of the two ways the loop was made: the browser's encoder, or the live recorder
const made = vi.hoisted(() => ({ path: 'encoder' as 'encoder' | 'recorder' }))
vi.mock('./export/exportWebm', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./export/exportWebm')>()),
  webmSupport: () => ({ ok: true }),
  probeWebmSupport: async () => ({ ok: true }),
  exportSpecimenWebm: async () => ({ blob: { size: 6_240_000, type: 'video/webm' } as Blob, path: made.path }),
}))

function renderPanel() {
  const entry = pitchBySlug('four-seam')
  if (!entry) throw new Error('four-seam is filed')
  const engine = {
    store: { get: () => ({ rx: 0, ry: 0, mx: 50, my: 50, lightOffsetX: 0, lightOffsetY: 0, lightHeight: 1.1, lightStrength: 1 }) },
  } as unknown as TiltEngine
  render(
    <ExportPanel
      entry={entry}
      face="front"
      front={PRESETS['ember-chrome']}
      back={PRESETS['quiet-ink-bone']}
      engine={engine}
      stageRef={{ current: null }}
      onBusy={() => undefined}
    />,
  )
}

describe('ExportPanel', () => {
  it('says before the click that the loop takes a while to make', async () => {
    renderPanel()
    expect(await screen.findByText(/can take a minute or more to make/)).toBeInTheDocument()
  })

  it('names the size of a finished PNG', async () => {
    png.size = 1_520_000
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: 'Export PNG' }))
    expect(await screen.findByText(/^Saved .+\.png \(1\.5 MB\)\.$/)).toBeInTheDocument()
  })

  it('names a file that rounds to a thousand kilobytes in megabytes', async () => {
    png.size = 999_600
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: 'Export PNG' }))
    expect(await screen.findByText(/^Saved .+\.png \(1\.0 MB\)\.$/)).toBeInTheDocument()
  })

  it('names the size of a finished loop', async () => {
    made.path = 'encoder'
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: /Export WebM/ }))
    expect(await screen.findByText(/^Saved .+\.webm \(6\.2 MB\): a 7 second loop\.$/)).toBeInTheDocument()
  })

  it('does not promise seven seconds when the live recorder made the loop', async () => {
    made.path = 'recorder'
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: /Export WebM/ }))
    expect(
      await screen.findByText(/^Saved .+\.webm \(6\.2 MB\)\. Recorded live, so it may stutter and run short of seven seconds\.$/),
    ).toBeInTheDocument()
    expect(screen.queryByText(/a 7 second loop/)).not.toBeInTheDocument()
  })
})
