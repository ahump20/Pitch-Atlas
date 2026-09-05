import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PITCHES } from '../../data/pitches'
import { BallStage } from './BallStage'

vi.mock('../../hooks/useWebGLSupport', () => ({ useWebGLSupport: () => true }))
vi.mock('./three/BallScene', () => ({
  default: ({ onReady }: { onReady: () => void }) => <button data-testid="model-frame" onClick={onReady}>Draw first frame</button>,
}))

describe('BallStage startup', () => {
  it('keeps the grip schematic visible until the model reports its first draw', async () => {
    const { container } = render(<BallStage entry={PITCHES[0]} grip faceGrip />)
    expect(container.querySelector('[data-stage-loading] svg')).not.toBeNull()
    const frame = await screen.findByTestId('model-frame')
    // Loading the module alone must not expose an empty canvas.
    expect(container.querySelector('[data-stage-loading] svg')).not.toBeNull()
    expect(frame.parentElement).toHaveStyle({ opacity: '0' })
    fireEvent.click(frame)
    expect(container.querySelector('[data-stage-loading]')).toBeNull()
    expect(frame.parentElement).toHaveStyle({ opacity: '1' })
  })
})
