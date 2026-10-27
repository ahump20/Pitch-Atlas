import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { pitchBySlug } from '../../data/pitches'
import { BenchBody } from './BenchBody'

vi.mock('../../hooks/useWebGLSupport', () => ({ useWebGLSupport: () => true }))
vi.mock('../ball/three/BallScene', () => ({
  default: function Scene({ onReady }: { onReady: () => void }) {
    const [lost, setLost] = useState(false)
    if (lost) throw new Error('WebGL context lost')
    return (
      <>
        <button data-testid="model-frame" onClick={onReady}>Draw first frame</button>
        <button data-testid="lose-context" onClick={() => setLost(true)}>Lose the context</button>
      </>
    )
  },
}))

describe('the bench stage label', () => {
  it('names the reference model only while its frame is on screen', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <MemoryRouter>
        <BenchBody entries={[pitchBySlug('slider')!]} aspect="grip" orientation={null} hand="right" onChange={() => {}} />
      </MemoryRouter>,
    )
    // while the model loads the stage shows the schematic, and says so
    expect(screen.getByText('Seam-informed schematic')).toBeInTheDocument()
    fireEvent.click(await screen.findByTestId('model-frame'))
    expect(screen.getByText('Reference model')).toBeInTheDocument()
    // the model fails after its first frame: the fallback schematic is named again
    fireEvent.click(screen.getByTestId('lose-context'))
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
      render(
        <MemoryRouter>
          <BenchBody entries={[pitchBySlug('slider')!, pitchBySlug('eephus')!]} aspect="grip" orientation={null} hand="right" onChange={() => {}} />
        </MemoryRouter>,
      )
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
