import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GripAudioCue } from './GripAudioCue'

describe('GripAudioCue', () => {
  it('renders opt-in native controls and synchronized captions without autoplay', () => {
    const { container } = render(<GripAudioCue pitchSlug="four-seam" accentColor="#37D6FF" />)
    const audio = container.querySelector('audio')
    expect(audio).not.toBeNull()
    expect(audio).toHaveAttribute('controls')
    expect(audio).toHaveAttribute('preload', 'none')
    expect(audio).not.toHaveAttribute('autoplay')
    expect(container.querySelector('track[kind="captions"]')).not.toBeNull()
    expect(screen.getByText('Read synchronized transcript')).toBeInTheDocument()
  })

  it('renders nothing for a pitch without an approved cue', () => {
    const { container } = render(<GripAudioCue pitchSlug="splitter" accentColor="#37D6FF" />)
    expect(container).toBeEmptyDOMElement()
  })
})
