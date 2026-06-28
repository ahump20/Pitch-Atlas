import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './Input'

describe('ds/Input', () => {
  it('renders the archival rfx-input field', () => {
    render(<Input aria-label="Catalog query" />)
    const input = screen.getByRole('textbox', { name: 'Catalog query' })
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveClass('rfx-input')
  })

  it('merges a custom className onto the field', () => {
    render(<Input aria-label="Catalog query" className="w-64" />)
    const input = screen.getByRole('textbox', { name: 'Catalog query' })
    expect(input).toHaveClass('rfx-input')
    expect(input).toHaveClass('w-64')
  })

  it('renders a mono label above the field and wires the association', () => {
    render(<Input label="Pitch name" />)
    const label = screen.getByText('Pitch name')
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveClass('mono-label')
    // Resolving the input by its label text proves htmlFor/id association holds.
    const input = screen.getByLabelText('Pitch name')
    expect(input).toHaveClass('rfx-input')
    expect(label).toHaveAttribute('for', input.getAttribute('id'))
  })

  it('generates an id when none is supplied so the label stays associated', () => {
    render(<Input label="Repertoire filter" />)
    const input = screen.getByLabelText('Repertoire filter')
    expect(input.id).not.toBe('')
  })

  it('respects an explicit id prop', () => {
    render(<Input label="Family" id="family-field" />)
    expect(screen.getByLabelText('Family')).toHaveAttribute('id', 'family-field')
  })

  it('renders no label element when label is omitted', () => {
    const { container } = render(<Input aria-label="Catalog query" />)
    expect(container.querySelector('label')).toBeNull()
    expect(container.querySelector('input')).toHaveClass('rfx-input')
  })

  it('forwards value and onChange for controlled use', () => {
    const onChange = vi.fn()
    render(<Input label="Pitch name" value="cutter" onChange={onChange} />)
    const input = screen.getByLabelText('Pitch name')
    expect(input).toHaveValue('cutter')
    fireEvent.change(input, { target: { value: 'slider' } })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('forwards arbitrary input attributes (type, placeholder, disabled)', () => {
    render(<Input label="Email" type="email" placeholder="name@example.com" disabled />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'name@example.com')
    expect(input).toBeDisabled()
  })
})
