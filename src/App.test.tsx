import { describe, it, expect, afterEach } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import { App } from './App'

/*
  Smoke tests against the no-WebGL path (jsdom has no WebGL, so the page renders
  through its honest static fallback) plus the specimen routing. The hash carries
  the selected pitch, so each test resets it.
*/

const HERO_H1 = 'The living field manual for pitching grips.'

afterEach(() => {
  window.location.hash = ''
})

describe('App (no-WebGL render is complete)', () => {
  it('renders the field manual and every layer', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(HERO_H1)
    expect(screen.getByText('How the Atlas works')).toBeInTheDocument()
    expect(screen.getByText('The catalog')).toBeInTheDocument()
    expect(screen.getAllByText('Grip Lab').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Release Room').length).toBeGreaterThan(0)
    expect(screen.getByText('Movement translation')).toBeInTheDocument()
    expect(screen.getByText('Master files')).toBeInTheDocument()
    expect(screen.getByText(/Field notes from the bullpen/)).toBeInTheDocument()
  })

  it('shows real, sourced master-variant figures', () => {
    render(<App />)
    expect(screen.getByText('2,530 rpm')).toBeInTheDocument()
    expect(screen.getByText('18.4 in')).toBeInTheDocument()
    expect(screen.getByText('8.9 in')).toBeInTheDocument()
  })

  it('states the provenance model and a computed as-of date', () => {
    render(<App />)
    expect(
      screen.getByText(/Sourced, not corrected\. Many ways can work\./),
    ).toBeInTheDocument()
    expect(screen.getByText(/As of .*\d{4}\./)).toBeInTheDocument()
  })

  it('shows the community layer as an honest unlaunched preview and a skip link', () => {
    render(<App />)
    // the layer ships gated (community.enabled === false): the surface shows its
    // "opening soon" preview, makes no Supabase calls, and renders no live list.
    expect(screen.getByText(/Field notes open soon\./)).toBeInTheDocument()
    expect(screen.getByText('Skip to content')).toHaveAttribute('href', '#main')
  })

  it('shows no fabricated community count before real data loads', () => {
    render(<App />)
    // the "<n> live" count only renders once notes load from the database; at
    // first paint no invented count is shown. No fake "X people waiting" either.
    expect(screen.queryByText(/\d+\s+live/)).toBeNull()
  })

  it('shows no failure signatures anywhere in the rendered text', () => {
    const { container } = render(<App />)
    const text = container.textContent ?? ''
    for (const bad of ['undefined', 'NaN', '[object Object]', 'Math.random', 'Loading...', 'TODO', 'placeholder', 'Baseball Atlas']) {
      expect(text).not.toContain(bad)
    }
  })
})

describe('Specimen index (routing)', () => {
  it('lists every specimen in the masthead switcher', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Specimen index' })
    for (const name of ['Four-seam', 'Sinker', 'Circle change', '12-6 curve', 'Slider']) {
      expect(within(nav).getByText(name)).toBeInTheDocument()
    }
  })

  it('deep-links a specimen from the hash', () => {
    window.location.hash = '#/slider'
    render(<App />)
    // the hero headline is fixed; the selected pitch leads the Grip Lab
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(HERO_H1)
    const lab = within(document.getElementById('grip-lab') as HTMLElement)
    expect(lab.getByRole('heading', { level: 2 })).toHaveTextContent('Slider')
  })

  it('switches specimen live when the hash changes', () => {
    render(<App />)
    const lab = () => within(document.getElementById('grip-lab') as HTMLElement)
    expect(lab().getByRole('heading', { level: 2 })).toHaveTextContent('Four-seam fastball')
    act(() => {
      window.location.hash = '#/twelve-six'
      window.dispatchEvent(new Event('hashchange'))
    })
    expect(lab().getByRole('heading', { level: 2 })).toHaveTextContent('12-6 curveball')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(HERO_H1)
  })

  it('marks the active specimen with aria-current', () => {
    window.location.hash = '#/two-seam'
    render(<App />)
    const current = screen.getByRole('link', { current: 'page' })
    expect(current).toHaveTextContent('Sinker')
  })

  it('an in-page anchor does not change the selected specimen', () => {
    window.location.hash = '#/slider'
    render(<App />)
    // the skip link points at #main, an in-page anchor, never #/<slug>
    expect(screen.getByText('Skip to content')).toHaveAttribute('href', '#main')
    const lab = within(document.getElementById('grip-lab') as HTMLElement)
    expect(lab.getByRole('heading', { level: 2 })).toHaveTextContent('Slider')
  })
})
