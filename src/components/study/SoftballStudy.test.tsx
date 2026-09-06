import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Link, MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { SOFTBALL_PITCHES } from '../../data/softball'
import { SoftballStudy } from './SoftballStudy'

vi.mock('../../hooks/useReducedMotion', () => ({ useReducedMotion: () => true }))
const pitch = SOFTBALL_PITCHES.find(p => p.slug === 'riseball')!

function Location() { return <output data-testid="location">{useLocation().search}</output> }
function Return() { const navigate = useNavigate(); return <button onClick={() => navigate(-1)}>Back to the circle</button> }

describe('softball written study', () => {
  it('keeps the sourced hold visible while changing spin and movement accounts', () => {
    const { container } = render(<MemoryRouter><SoftballStudy pitch={pitch} /></MemoryRouter>)
    const grip = screen.getByRole('complementary', { name: 'The written grip' })
    expect(within(grip).getByText(pitch.grip.value)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '02 The spin' }))
    expect(within(screen.getByRole('article')).getByText(pitch.spin.value)).toBeVisible()
    expect(within(grip).getByText(pitch.grip.value)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Next detail' }))
    expect(within(screen.getByRole('article')).getByText(pitch.movement.value)).toBeVisible()
    expect(within(screen.getByRole('article')).getByRole('link')).toHaveAttribute('href', pitch.movement.source!.url)
    expect(screen.getByRole('button', { name: 'Next detail' })).toBeDisabled()
    expect(container.querySelector('canvas, svg')).toBeNull()
  })

  it('retains the study step and unrelated URL context after opening another file and returning', () => {
    render(<MemoryRouter initialEntries={['/softball/pitch/riseball?from=circle']}><Location /><Routes>
      <Route path="/softball/pitch/:slug" element={<><SoftballStudy pitch={pitch} /><Link to="/softball/craftsmen/cat-osterman">Follow the pitcher</Link></>} />
      <Route path="/softball/craftsmen/:slug" element={<Return />} />
    </Routes></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: '03 The movement' }))
    fireEvent.click(screen.getByRole('link', { name: 'Follow the pitcher' }))
    fireEvent.click(screen.getByRole('button', { name: 'Back to the circle' }))
    expect(screen.getByRole('button', { name: '03 The movement' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('location')).toHaveTextContent('?from=circle&study=movement')
  })

  it('opens an unknown step at the hold and retains all written evidence for static reading', () => {
    render(<MemoryRouter initialEntries={['/?study=invented']}><SoftballStudy pitch={pitch} /></MemoryRouter>)
    expect(screen.getByRole('button', { name: '01 The hold' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Previous detail' })).toBeDisabled()
    const complete = screen.getByText('The complete written record').closest('details')!
    expect(complete).toHaveTextContent(pitch.spin.value)
    expect(complete).toHaveTextContent(pitch.movement.value)
    expect(screen.getByText(/separate fingertip map, seam model and master-variant record are not documented/)).toBeVisible()
  })
})
