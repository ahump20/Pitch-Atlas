import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ExternalPlatform } from '../../data/media/external'
import { PipProvider } from './pip'
import { usePip } from './pipContext'

const PROVIDERS: Array<{ platform: ExternalPlatform; externalId: string; url: string }> = [
  { platform: 'x', externalId: '1016866886863278080', url: 'https://x.com/PitchingNinja/status/1016866886863278080' },
  { platform: 'tiktok', externalId: '7544907808555240735', url: 'https://www.tiktok.com/@example/video/7544907808555240735' },
  { platform: 'instagram', externalId: 'ExamplePost', url: 'https://www.instagram.com/p/ExamplePost/' },
  { platform: 'youtube', externalId: 'ExampleVideo', url: 'https://www.youtube.com/watch?v=ExampleVideo' },
]

function DockOpener({ platform, externalId, url }: (typeof PROVIDERS)[number]) {
  const dock = usePip()
  return (
    <button
      type="button"
      onClick={() => dock.open({ platform, externalId, url, title: `${platform} lesson`, author: '@source', authorUrl: url })}
    >
      Open {platform}
    </button>
  )
}

describe('Watch Dock', () => {
  beforeEach(() => window.sessionStorage.clear())
  afterEach(() => window.sessionStorage.clear())

  it.each(PROVIDERS)('reopens the same $platform item honestly from its beginning', (item) => {
    render(<PipProvider><DockOpener {...item} /></PipProvider>)
    fireEvent.click(screen.getByRole('button', { name: `Open ${item.platform}` }))
    const dialog = screen.getByRole('dialog', { name: `Now playing: ${item.platform} lesson` })
    expect(dialog).toHaveAttribute('data-resume-behavior', 'restart')
    expect(dialog.querySelectorAll('iframe')).toHaveLength(1)
  })

  it('persists while the routed child tree changes and closes on command', () => {
    const { rerender } = render(
      <PipProvider>
        <DockOpener {...PROVIDERS[0]} />
        <p>First route</p>
      </PipProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Open x' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    rerender(<PipProvider><p>Second route</p></PipProvider>)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Close player/ }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('restores the credited item after a document-level route navigation', () => {
    const firstDocument = render(<PipProvider><DockOpener {...PROVIDERS[0]} /></PipProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Open x' }))
    firstDocument.unmount()

    render(<PipProvider><p>Next prerendered route</p></PipProvider>)
    const dialog = screen.getByRole('dialog', { name: 'Now playing: x lesson' })
    expect(dialog).toHaveAttribute('data-resume-behavior', 'restart')
    expect(dialog.querySelectorAll('iframe')).toHaveLength(1)
  })
})
