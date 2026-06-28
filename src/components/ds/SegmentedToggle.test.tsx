import { render, screen, fireEvent } from '@testing-library/react'
import { SegmentedToggle } from './SegmentedToggle'

describe('ds/SegmentedToggle', () => {
  it('renders one .rfx-seg button per option inside the segmented shell', () => {
    const { container } = render(<SegmentedToggle options={['RHP', 'LHP']} value="RHP" />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('type', 'button')
      expect(button.className).toContain('rfx-seg')
    })
    const shell = container.firstElementChild as HTMLElement
    expect(shell.className).toContain('inline-flex')
    expect(shell.className).toContain('overflow-hidden')
    expect(shell.className).toContain('rounded-lg')
    expect(shell.className).toContain('border')
  })

  it('marks the option matching value with the aria-pressed on-state', () => {
    render(<SegmentedToggle options={['RHP', 'LHP']} value="LHP" />)
    expect(screen.getByRole('button', { name: 'RHP' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'LHP' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onChange with the clicked option value', () => {
    const onChange = vi.fn()
    render(<SegmentedToggle options={['RHP', 'LHP']} value="RHP" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'LHP' }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('LHP')
  })

  it('supports { value, label } options — renders the label, reports the value', () => {
    const onChange = vi.fn()
    render(
      <SegmentedToggle
        options={[
          { value: 'both', label: 'Both balls' },
          { value: 'single', label: 'Single ball' },
        ]}
        value="both"
        onChange={onChange}
      />,
    )
    expect(screen.getByRole('button', { name: 'Both balls' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Single ball' }))
    expect(onChange).toHaveBeenCalledWith('single')
  })

  it('merges className onto the shell', () => {
    const { container } = render(
      <SegmentedToggle options={['RHP', 'LHP']} value="RHP" className="border-cyan/30" />,
    )
    expect((container.firstElementChild as HTMLElement).className).toContain('border-cyan/30')
  })
})
