import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { PITCHES } from '../../data/pitches'
import { GripStudy } from './GripStudy'
import { GripInspection } from './GripInspection'
import { ChapterSections } from './ChapterSections'

vi.mock('../../hooks/useWebGLSupport', () => ({ useWebGLSupport: () => false }))
vi.mock('../../hooks/useReducedMotion', () => ({ useReducedMotion: () => true }))

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})

describe('Grip study', () => {
  const entry = PITCHES.find(p => p.display.slug === 'four-seam')!
  it('keeps the sourced study usable with reduced motion and no WebGL', () => {
    const { container } = render(<GripStudy entry={entry} accentColor="#bba577" />)
    expect(container.querySelector('canvas')).toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /02 Fingers/ }))
    expect(screen.getByRole('heading', { name: 'Read the finger placement.' })).toBeVisible()
    expect(within(screen.getByRole('article')).getByText(entry.canonical.gripDetails[0].value)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: /04 Sourced cue/ }))
    expect(screen.getByText((entry.canonical.voice ?? entry.canonical.mechanics).value)).toBeVisible()
  })
  it('does not offer fabricated model inspection for an unfiled hold', () => {
    const unsupported = PITCHES.find(p => p.canonical.gripModel.status === 'unfiled')!
    render(<GripStudy entry={unsupported} accentColor="#bba577" />)
    expect(screen.queryByRole('button', { name: 'Inspect reference model' })).not.toBeInTheDocument()
  })
  it('retains the selected master while moving between study steps', () => {
    render(<GripStudy entry={entry} accentColor="#bba577" />)
    const master = entry.masterVariants[0]
    fireEvent.change(screen.getByLabelText('Keep a master file beside the hold'), { target: { value: master.pitcher } })
    fireEvent.click(screen.getByRole('button', { name: /03 Seam/ }))
    expect(screen.getByText(`Selected master · ${master.pitcher}`)).toBeVisible()
  })
  it('links chapter controls to supplied section IDs', () => {
    render(<ChapterSections sections={[{ id: 'sources', label: 'Sources' }]} />)
    expect(screen.getByRole('link', { name: 'Sources' })).toHaveAttribute('href', '#sources')
  })
  it('opens inspection, zooms, resets, closes and returns focus', () => {
    render(<GripInspection label="grip photograph"><img src="/test.webp" alt="Test grip" /></GripInspection>)
    const opener = screen.getByRole('button', { name: 'Inspect grip photograph' })
    fireEvent.click(opener)
    expect(screen.getByRole('dialog')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(screen.getByText('125%')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }))
    expect(screen.getByText('100%')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Close inspection' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(opener).toHaveFocus()
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})
