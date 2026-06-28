import { render, screen, fireEvent } from '@testing-library/react'
import { SearchField } from './SearchField'

describe('ds/SearchField', () => {
  it('renders a search input with a leading icon and placeholder', () => {
    render(<SearchField aria-label="Search the Pitch Index" placeholder="Search a pitch…" />)
    const input = screen.getByRole('searchbox', { name: 'Search the Pitch Index' })
    expect(input).toHaveAttribute('type', 'search')
    expect(input).toHaveAttribute('placeholder', 'Search a pitch…')
  })

  it('forwards value and onChange', () => {
    const onChange = vi.fn()
    render(<SearchField aria-label="Search" value="cutter" onChange={onChange} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'slider' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('calls onClear on Escape only when the field is non-empty', () => {
    const onClear = vi.fn()
    const { rerender } = render(<SearchField aria-label="Search" defaultValue="" onClear={onClear} />)
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Escape' })
    expect(onClear).not.toHaveBeenCalled()
    rerender(<SearchField aria-label="Search" defaultValue="curve" onClear={onClear} />)
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Escape' })
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
