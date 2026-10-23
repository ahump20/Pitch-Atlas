import { describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { createHead, UnheadProvider } from '@unhead/react/client'
import { MovementMapPage } from './MovementMapPage'

/*
  Where the viewer stands. The shape map draws a right-hander's arm side on the
  right. A right-hander's arm side is the third-base side: his right as he looks in
  from the mound, and a catcher's left from behind the plate. So the drawing is the
  pitcher's view, and every word on the page about the viewpoint has to say so.
  These tests hold the words to the drawing, and the drawing to where it is now.
*/

function setup() {
  const router = createMemoryRouter(
    [
      { path: '/movement-map', element: <MovementMapPage /> },
      { path: '/pitch/:slug', element: <h1>Specimen destination</h1> },
    ],
    { initialEntries: ['/movement-map'] },
  )
  render(
    <UnheadProvider head={createHead()}>
      <RouterProvider router={router} />
    </UnheadProvider>,
  )
}

const map = () => screen.getByRole('group', { name: /^Shape map of the filed pitches/ })

const poleX = (pole: 'ARM' | 'GLOVE') => Number(within(map()).getByText(pole).getAttribute('x'))

const markerXs = (shape: RegExp) =>
  within(map())
    .getAllByRole('link', { name: shape })
    .map((marker) => Number(marker.querySelector('circle')!.getAttribute('cx')))

describe('Shape map point of view', () => {
  it('names the pitcher’s view in the map’s label, for either hand, and never the catcher’s', async () => {
    const user = userEvent.setup()
    setup()

    const rhp = map().getAttribute('aria-label')!
    expect(rhp).toMatch(/as a right-handed pitcher sees them from the mound/)
    expect(rhp).not.toMatch(/catcher/i)

    await user.click(screen.getByRole('button', { name: 'LHP' }))
    const lhp = map().getAttribute('aria-label')!
    expect(lhp).toMatch(/as a left-handed pitcher sees them from the mound/)
    expect(lhp).not.toMatch(/catcher/i)
  })

  it('names the pitcher’s view in the page intro, and never the catcher’s', () => {
    setup()
    const intro = screen.getByText(/whether each filed pitch rides or drops/).textContent!
    expect(intro).toMatch(/as the pitcher sees it from the mound/)
    expect(intro).not.toMatch(/catcher/i)
  })

  it('names the pitcher’s view in the search description and the structured data', async () => {
    setup()
    await waitFor(() => {
      expect(document.head.querySelector('meta[name="description"]')).not.toBeNull()
      expect(document.head.querySelector('script[type="application/ld+json"]')).not.toBeNull()
    })

    const description = document.head.querySelector('meta[name="description"]')!.getAttribute('content')!
    expect(description).toMatch(/as the pitcher sees it/)
    expect(description).not.toMatch(/catcher/i)

    const graph = JSON.parse(document.head.querySelector('script[type="application/ld+json"]')!.textContent!)
    const structured: string = graph['@graph'][0].description
    expect(structured).toBe(description)
  })

  it('keeps the drawing: a right-hander’s arm side on the right, mirrored for a left-hander', async () => {
    const user = userEvent.setup()
    setup()

    expect(poleX('ARM')).toBeGreaterThan(poleX('GLOVE'))
    expect(Math.min(...markerXs(/runs arm-side/))).toBeGreaterThan(Math.max(...markerXs(/sweeps glove-side/)))

    await user.click(screen.getByRole('button', { name: 'LHP' }))
    expect(poleX('ARM')).toBeLessThan(poleX('GLOVE'))
    expect(Math.max(...markerXs(/runs arm-side/))).toBeLessThan(Math.min(...markerXs(/sweeps glove-side/)))
  })
})
