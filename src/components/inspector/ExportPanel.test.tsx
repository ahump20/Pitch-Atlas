import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { pitchBySlug } from '../../data/pitches'
import type { TiltEngine } from '../../hooks/useCardTilt'
import { PRESETS } from '../refractor/material/materialPresets'
import { ExportPanel } from './ExportPanel'
import type { ExportRequest, WebmSupport } from './export/types'

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

// which of the two ways the loop was made: the browser's encoder, or the live recorder;
// what the support check found before the click; and what the export was handed
const made = vi.hoisted(() => ({
  path: 'encoder' as 'encoder' | 'recorder',
  probe: { ok: true, via: { path: 'encoder', codec: 'vp9' } } as WebmSupport,
  requests: [] as ExportRequest[],
}))
vi.mock('./export/exportWebm', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./export/exportWebm')>()),
  webmSupport: () => ({ ok: true }),
  probeWebmSupport: async () => made.probe,
  exportSpecimenWebm: async (req: ExportRequest) => {
    made.requests.push(req)
    return { blob: { size: 6_240_000, type: 'video/webm' } as Blob, path: made.path }
  },
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
  it('says before the click what the loop will be, and that it takes a while to make', async () => {
    made.probe = { ok: true, via: { path: 'encoder', codec: 'vp9' } }
    renderPanel()
    expect(await screen.findByText('The WebM is a seven-second loop. It can take a minute or more to make.')).toBeInTheDocument()
    // the length lives in the note, not on the button
    expect(screen.getByRole('button', { name: 'Export WebM' })).toBeInTheDocument()
  })

  it('does not promise seven seconds before the click where only the live recorder can make the loop', async () => {
    made.probe = { ok: true, via: { path: 'recorder', mimeType: 'video/webm' } }
    renderPanel()
    expect(await screen.findByText('The WebM is recorded live, so it may stutter or run short. It can take a minute or more.')).toBeInTheDocument()
    expect(screen.queryByText(/seven-second/)).not.toBeInTheDocument()
  })

  it('hands the export what the support check found, so it does not ask again', async () => {
    made.probe = { ok: true, via: { path: 'encoder', codec: 'vp8' } }
    made.requests.length = 0
    const user = userEvent.setup()
    renderPanel()
    await screen.findByText(/seven-second loop/)
    await user.click(screen.getByRole('button', { name: 'Export WebM' }))
    await screen.findByText(/^Saved /)
    expect(made.requests[0].via).toEqual({ path: 'encoder', codec: 'vp8' })
  })

  it('chooses the backdrop with a two-part switch, the way the face is chosen', async () => {
    const user = userEvent.setup()
    renderPanel()
    const backdrop = screen.getByRole('group', { name: 'Backdrop' })
    expect(backdrop).toHaveClass('specimen-seg')
    const dark = within(backdrop).getByRole('button', { name: 'Dark' })
    const clear = within(backdrop).getByRole('button', { name: 'Transparent' })
    expect(dark).toHaveAttribute('aria-pressed', 'true')
    await user.click(clear)
    expect(clear).toHaveAttribute('aria-pressed', 'true')
    expect(dark).toHaveAttribute('aria-pressed', 'false')
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
    made.probe = { ok: true, via: { path: 'encoder', codec: 'vp9' } }
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: /Export WebM/ }))
    expect(await screen.findByText(/^Saved .+\.webm \(6\.2 MB\): a seven-second loop\.$/)).toBeInTheDocument()
  })

  it('does not promise seven seconds when the live recorder made the loop', async () => {
    made.path = 'recorder'
    made.probe = { ok: true, via: { path: 'recorder', mimeType: 'video/webm' } }
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: /Export WebM/ }))
    expect(
      await screen.findByText(/^Saved .+\.webm \(6\.2 MB\)\. Recorded live, so it may stutter and run short of seven seconds\.$/),
    ).toBeInTheDocument()
    expect(screen.queryByText(/seven-second loop\./)).not.toBeInTheDocument()
  })
})
