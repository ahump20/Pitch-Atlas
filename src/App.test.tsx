import { describe, it, expect, afterEach } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import { App } from './App'

/*
  Smoke tests against the no-WebGL path (jsdom has no WebGL, so the page renders
  through its honest static fallback) plus the specimen routing. The hash carries
  the selected pitch, so each test resets it.
*/

afterEach(() => {
  window.location.hash = ''
})

describe('App (no-WebGL render is complete)', () => {
  it('renders the four-seam reference and every tier', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The pitch, in your hand.')
    expect(screen.getByText('The atlas')).toBeInTheDocument()
    expect(screen.getByText('The grip')).toBeInTheDocument()
    expect(screen.getByText('Master variants')).toBeInTheDocument()
    expect(screen.getByText('Community')).toBeInTheDocument()
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

  it('has an honest empty community state and a keyboard skip link', () => {
    render(<App />)
    expect(screen.getByText('Empty')).toBeInTheDocument()
    expect(screen.getByText('Skip to content')).toHaveAttribute('href', '#main')
  })

  it('shows no failure signatures anywhere in the rendered text', () => {
    const { container } = render(<App />)
    const text = container.textContent ?? ''
    for (const bad of ['undefined', 'NaN', '[object Object]', 'Math.random', 'Loading...', 'TODO', 'placeholder']) {
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
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The pitch, in your hand.')
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
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The pitch, in your hand.')
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
