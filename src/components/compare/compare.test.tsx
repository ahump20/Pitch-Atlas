import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { CompareProvider } from './CompareProvider'
import { CompareButton } from './CompareButton'
import { CompareTray } from './CompareTray'
import { useCompare } from './compareContext'
import { COMPARE_KEY, EMPTY_SELECTION, compareUrl, normalizeSelection, parseSelection } from './selection'

function Probe() {
  const compare = useCompare()!
  const location = useLocation()
  return <><output data-testid="pair">{JSON.stringify(compare.selection)}</output><output data-testid="url">{location.search}</output><button onClick={() => compare.update({ view: 'cues', hand: 'left' })}>Read cues</button><Link to="/compare">Workspace</Link><Link to="/pitch/slider">Study</Link></>
}
function setup(url = '/') {
  return render(<MemoryRouter initialEntries={[url]}><CompareProvider><CompareButton slug="four-seam" /><CompareButton slug="circle-change" /><CompareButton slug="slider" /><Routes><Route path="*" element={<Probe />} /></Routes><CompareTray /></CompareProvider></MemoryRouter>)
}
beforeEach(() => { sessionStorage.clear(); vi.restoreAllMocks() })
describe('comparison selection', () => {
  it('rejects invalid slugs and duplicate pairs without inventing defaults', () => {
    expect(parseSelection('?a=bogus&b=four-seam&hand=bad&view=bad')).toEqual({ ...EMPTY_SELECTION, b: 'four-seam' })
    expect(normalizeSelection({ a: 'slider', b: 'slider' })).toEqual({ ...EMPTY_SELECTION, a: 'slider' })
  })
  it('roundtrips all comparison choices through a shareable URL', () => {
    const selection = normalizeSelection({ a: 'four-seam', b: 'slider', view: 'movement', hand: 'left', orientation: 'thumb' })
    expect(parseSelection(compareUrl(selection).split('?')[1])).toEqual(selection)
  })
  it('keeps the current pair when replacement is cancelled and replaces the chosen slot', async () => {
    const user = userEvent.setup(); setup()
    await user.click(screen.getByRole('button', { name: 'Compare four seam' }))
    await user.click(screen.getByRole('button', { name: 'Compare circle change' }))
    await user.click(screen.getByRole('button', { name: 'Compare slider' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Keep current pair' }))
    expect(screen.getByTestId('pair')).toHaveTextContent('circle-change')
    await user.click(screen.getByRole('button', { name: 'Compare slider' }))
    await user.click(screen.getByRole('button', { name: 'Replace Circle change' }))
    expect(screen.getByTestId('pair')).toHaveTextContent('slider')
    expect(screen.getByTestId('pair')).not.toHaveTextContent('circle-change')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('preserves the pair across routes, view changes and session persistence', async () => {
    const user = userEvent.setup(); setup('/compare?a=four-seam&b=slider&view=grips')
    await user.click(screen.getByRole('button', { name: 'Read cues' }))
    expect(screen.getByTestId('url')).toHaveTextContent('view=cues')
    expect(screen.getByTestId('url')).toHaveTextContent('hand=left')
    await user.click(screen.getByRole('link', { name: 'Study' }))
    expect(screen.getByTestId('pair')).toHaveTextContent('slider')
    expect(screen.getByRole('link', { name: 'Compare pair' })).toHaveAttribute('href', expect.stringContaining('view=cues'))
    await waitFor(() => expect(JSON.parse(sessionStorage.getItem(COMPARE_KEY)!)).toMatchObject({ a: 'four-seam', b: 'slider', view: 'cues' }))
  })
  it('reads and updates canonical trailing-slash comparison links', async () => {
    const user = userEvent.setup(); setup('/compare/?a=four-seam&b=slider&view=grips')
    expect(screen.getByTestId('pair')).toHaveTextContent('slider')
    expect(screen.queryByRole('complementary', { name: 'Selected pitches' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Read cues' }))
    expect(screen.getByTestId('url')).toHaveTextContent('view=cues')
  })
  it('lets explicit invalid links override stored selections', async () => {
    sessionStorage.setItem(COMPARE_KEY, JSON.stringify({ ...EMPTY_SELECTION, a: 'slider', b: 'four-seam' }))
    setup('/compare?a=missing&b=')
    await waitFor(() => expect(screen.getByTestId('pair')).toHaveTextContent('"a":null,"b":null'))
  })
  it('restores saved selection without a URL and tolerates denied storage', async () => {
    sessionStorage.setItem(COMPARE_KEY, JSON.stringify({ ...EMPTY_SELECTION, a: 'slider' }))
    const mounted = setup()
    await waitFor(() => expect(screen.getByTestId('pair')).toHaveTextContent('slider'))
    mounted.unmount()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    setup()
    expect(screen.getByTestId('pair')).toHaveTextContent('"a":null')
  })
})
