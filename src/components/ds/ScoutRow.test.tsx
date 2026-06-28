import { fireEvent, render, screen } from '@testing-library/react'
import { ScoutRow } from './ScoutRow'

describe('ds/ScoutRow', () => {
  it('renders the rfx-scout-row / -k / -v markup the class expects', () => {
    const { container } = render(<ScoutRow label="Velocity">94 mph, two-seam grip</ScoutRow>)
    const row = container.querySelector('.rfx-scout-row')
    expect(row).not.toBeNull()
    expect(row?.tagName).toBe('DIV')

    const k = row?.querySelector('.rfx-scout-k')
    const v = row?.querySelector('.rfx-scout-v')
    expect(k?.tagName).toBe('SPAN')
    expect(v?.tagName).toBe('SPAN')
    expect(k?.textContent).toBe('Velocity')
    expect(v?.textContent).toBe('94 mph, two-seam grip')

    // key first, value second — the 56px / 1fr grid order the class lays out.
    expect(row?.children.length).toBe(2)
    expect(row?.children[0]).toBe(k)
    expect(row?.children[1]).toBe(v)
  })

  it('omits the confidence dot when no tier is set', () => {
    const { container } = render(<ScoutRow label="Family">Fastball</ScoutRow>)
    expect(container.querySelector('.rfx-dot')).toBeNull()
    // value cell stays plain — no inline-flex carrier when there is no dot.
    expect(container.querySelector('.rfx-scout-v')?.className).toBe('rfx-scout-v')
  })

  it('appends the ConfidenceDot inside the value cell when a tier is set', () => {
    const { container } = render(
      <ScoutRow label="Release" tier="official">
        7.1 ft extension
      </ScoutRow>,
    )
    const v = container.querySelector('.rfx-scout-v')
    // The dot lives inside the value cell, not as a stray third grid child.
    expect(v?.querySelector('.rfx-dot')).not.toBeNull()
    expect(container.querySelector('.rfx-scout-row')?.children.length).toBe(2)
  })

  it('maps each short tier to the right confidence label', () => {
    const cases = [
      ['official', 'Official data'],
      ['reputable', 'Reputable analysis'],
      ['secondhand', 'Secondhand, attributed'],
      ['unverified', 'Unverified'],
    ] as const
    for (const [tier, label] of cases) {
      const { unmount } = render(
        <ScoutRow label="Source" tier={tier}>
          relayed figure
        </ScoutRow>,
      )
      expect(screen.getByText(label)).toBeInTheDocument()
      unmount()
    }
  })

  it('merges a caller className alongside rfx-scout-row', () => {
    const { container } = render(
      <ScoutRow label="Shape" className="border-t">
        two-plane break
      </ScoutRow>,
    )
    const row = container.querySelector('.rfx-scout-row')
    expect(row?.className).toContain('rfx-scout-row')
    expect(row?.className).toContain('border-t')
  })

  it('forwards arbitrary attributes and event handlers through the rest spread', () => {
    let clicks = 0
    render(
      <ScoutRow
        label="Grip"
        data-testid="scout-row"
        title="Index and middle across the horseshoe"
        onClick={() => {
          clicks += 1
        }}
      >
        across the long seams
      </ScoutRow>,
    )
    const row = screen.getByTestId('scout-row')
    expect(row).toHaveAttribute('title', 'Index and middle across the horseshoe')
    fireEvent.click(row)
    expect(clicks).toBe(1)
  })
})
