import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { pitchBySlug } from '../../data/pitches'
import { BenchBody } from './BenchBody'

vi.mock('../../hooks/useWebGLSupport', () => ({ useWebGLSupport: () => true }))
// the canvas stand-in: a click draws the first frame, and the scene can be made to throw
vi.mock('../ball/three/BallScene', () => ({
  default: function Scene({ onReady }: { onReady: () => void }) {
    const [broken, setBroken] = useState(false)
    if (broken) throw new Error('the scene threw')
    return (
      <>
        <button data-testid="model-frame" onClick={onReady}>Draw first frame</button>
        <button data-testid="break-scene" onClick={() => setBroken(true)}>Break the scene</button>
      </>
    )
  },
}))

const bench = (slugs: string[]) =>
  render(
    <MemoryRouter>
      <BenchBody entries={slugs.map((slug) => pitchBySlug(slug)!)} aspect="grip" orientation={null} hand="right" onChange={() => {}} />
    </MemoryRouter>,
  )

describe('the bench stage label', () => {
  it('names the reference model only once its first frame is on screen', async () => {
    bench(['slider'])
    // while the model loads the stage shows the schematic, and says so
    expect(screen.getByText('Seam-informed schematic')).toBeInTheDocument()
    fireEvent.click(await screen.findByTestId('model-frame'))
    expect(screen.getByText('Reference model')).toBeInTheDocument()
  })

  it('goes back to the schematic when the context is lost, and to the model once it is restored and drawn', async () => {
    const { container } = bench(['slider'])
    fireEvent.click(await screen.findByTestId('model-frame'))
    // three.js absorbs a lost context without throwing: the event is all there is
    fireEvent(screen.getByTestId('model-frame'), new Event('webglcontextlost'))
    expect(screen.getByText('Seam-informed schematic')).toBeInTheDocument()
    expect(container.querySelector('[data-stage-loading] svg')).not.toBeNull()
    fireEvent(screen.getByTestId('model-frame'), new Event('webglcontextrestored'))
    fireEvent.click(await screen.findByTestId('model-frame'))
    expect(screen.getByText('Reference model')).toBeInTheDocument()
    expect(container.querySelector('[data-stage-loading]')).toBeNull()
  })

  it('ignores a first frame that lands after the context is lost', async () => {
    const { container } = bench(['slider'])
    const frame = await screen.findByTestId('model-frame')
    fireEvent(frame, new Event('webglcontextlost'))
    // the frame scheduled before the loss lands late
    fireEvent.click(frame)
    expect(screen.getByText('Seam-informed schematic')).toBeInTheDocument()
    expect(container.querySelector('[data-stage-loading] svg')).not.toBeNull()
  })

  it('a restored context retries a scene that threw', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = bench(['slider'])
    fireEvent.click(await screen.findByTestId('model-frame'))
    fireEvent.click(screen.getByTestId('break-scene'))
    expect(screen.getByText('Seam-informed schematic')).toBeInTheDocument()
    fireEvent(container.querySelector('[data-bench-ball] svg')!, new Event('webglcontextrestored'))
    fireEvent.click(await screen.findByTestId('model-frame'))
    expect(screen.getByText('Reference model')).toBeInTheDocument()
    vi.mocked(console.error).mockRestore()
  })

  it('names the schematic again when the scene throws after its first frame', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    bench(['slider'])
    fireEvent.click(await screen.findByTestId('model-frame'))
    fireEvent.click(screen.getByTestId('break-scene'))
    expect(screen.getByText('Seam-informed schematic')).toBeInTheDocument()
    expect(screen.queryByText('Reference model')).toBeNull()
    vi.mocked(console.error).mockRestore()
  })

  it('on a phone, a filed pitch back from an unfiled one says schematic while its model reloads', async () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query === '(max-width: 639px)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia
    const chip = () => document.querySelector('.bench-ball .bench-chip')?.textContent
    try {
      bench(['slider', 'eephus'])
      fireEvent.click(await screen.findByTestId('model-frame'))
      expect(chip()).toBe('Reference model')
      fireEvent.click(screen.getByRole('button', { name: /^B · / }))
      expect(chip()).toBe('No canonical grip on file')
      fireEvent.click(screen.getByRole('button', { name: /^A · / }))
      expect(chip()).toBe('Seam-informed schematic')
      fireEvent.click(await screen.findByTestId('model-frame'))
      expect(chip()).toBe('Reference model')
    } finally {
      window.matchMedia = original
    }
  })
})
