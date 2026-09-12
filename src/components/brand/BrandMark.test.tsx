import { render, screen } from '@testing-library/react'
import { BrandMark } from './BrandMark'

describe('BrandMark', () => {
  it('keeps the leather diamond and rainbow-foil ATLAS lockup together', () => {
    render(<BrandMark />)

    const atlas = screen.getByText('Atlas')
    expect(atlas).toHaveClass('rfx-holo')
    expect(atlas).toHaveAttribute('data-brand-material', 'rainbow-foil')

    const mark = atlas.parentElement?.parentElement?.querySelector('img')
    expect(mark).toHaveAttribute('src', '/brand/atlas-emblem-v2.png')
    expect(mark).toHaveAttribute('alt', '')

  })

  it('can render the mark without a wordmark', () => {
    const { container } = render(<BrandMark wordmark={false} />)

    expect(container.querySelector('img')).toBeInTheDocument()
    expect(screen.queryByText('Atlas')).not.toBeInTheDocument()
  })
})
