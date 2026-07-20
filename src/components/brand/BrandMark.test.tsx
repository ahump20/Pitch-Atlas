import { render, screen } from '@testing-library/react'
import { BrandMark } from './BrandMark'

describe('BrandMark', () => {
  it('keeps the leather diamond and rainbow-foil ATLAS lockup together', () => {
    render(<BrandMark />)

    const atlas = screen.getByText('Atlas')
    expect(atlas).toHaveClass('rfx-holo')
    expect(atlas).toHaveAttribute('data-brand-material', 'rainbow-foil')

    const mark = atlas.parentElement?.parentElement?.querySelector('svg')
    expect(mark).toBeInTheDocument()
    expect(mark?.querySelector('stop[stop-color="#9C7350"]')).toBeInTheDocument()
    expect(mark?.querySelector('ellipse[stroke="#37D6FF"]')).toBeInTheDocument()
  })

  it('can render the mark without a wordmark', () => {
    const { container } = render(<BrandMark wordmark={false} />)

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.queryByText('Atlas')).not.toBeInTheDocument()
  })
})
