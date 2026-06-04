import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'

/*
  Smoke test against the no-WebGL path (jsdom has no WebGL, so the page renders
  through its honest static fallback). This is the acceptance check that the
  reference is complete without a GPU.
*/
describe('App (no-WebGL render is complete)', () => {
  it('renders the four-seam reference and every tier', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The four-seam fastball.')
    expect(screen.getByText('Foundation')).toBeInTheDocument()
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
