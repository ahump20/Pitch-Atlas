import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RefractionBridge } from './RefractionBridge'
import { PITCHES } from '../../data/pitches'
import { MemoryRouter } from 'react-router-dom'

const featured = PITCHES.find((p) => p.display.specimenNo === '00') ?? PITCHES[0]
const visibility = vi.hoisted(() => ({ inView: true }))
vi.mock('../../hooks/useWebGLSupport', () => ({ useWebGLSupport: () => true }))
vi.mock('../../hooks/useInView', () => ({ useInView: () => ({ ref: null, inView: visibility.inView }) }))
vi.mock('./AlignedSeamScene', () => ({
  default: ({ onReady }: { onReady: () => void }) => <button data-testid="seam-frame" onClick={onReady}>Draw first frame</button>,
}))

describe('RefractionBridge (the seam dissolve, taught)', () => {
  it('names the dissolve mechanism in plain words', () => {
    render(<RefractionBridge featured={featured} />, { wrapper: MemoryRouter })
    // the signature move only teaches if the page says, in words, that the 3D
    // ball and the flat diagram are one function, not two drawings. It is said
    // in more than one place (headline + prose), so match all of them.
    expect(screen.getAllByText(/one seam|same seam|single function/i).length).toBeGreaterThanOrEqual(1)
  })

  it('keeps the seam-informed label and never claims seam-accurate', () => {
    const { container } = render(<RefractionBridge featured={featured} />, { wrapper: MemoryRouter })
    expect(container.textContent).toMatch(/seam-informed schematic/i)
    expect(container.textContent).not.toMatch(/seam-accurate/i)
  })

  it('keeps the diagram until a first draw, including after an offscreen remount', async () => {
    const { container, rerender } = render(<RefractionBridge featured={featured} />, { wrapper: MemoryRouter })
    const model = () => container.querySelector('.archive-seam-model')
    expect(container.querySelector('.archive-seam-flat svg')).not.toBeNull()
    expect(model()).toHaveAttribute('data-ready', 'false')
    fireEvent.click(await screen.findByTestId('seam-frame'))
    expect(model()).toHaveAttribute('data-ready', 'true')
    visibility.inView = false
    rerender(<RefractionBridge featured={featured} />)
    expect(model()).toBeNull()
    visibility.inView = true
    rerender(<RefractionBridge featured={featured} />)
    expect(model()).toHaveAttribute('data-ready', 'false')
    expect(container.querySelector('.archive-seam-flat svg')).not.toBeNull()
    fireEvent.click(await screen.findByTestId('seam-frame'))
    expect(model()).toHaveAttribute('data-ready', 'true')
  })
})
