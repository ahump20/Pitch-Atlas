export interface GripAudioCue {
  pitchSlug: 'four-seam' | 'two-seam' | 'twelve-six' | 'three-finger-change'
  title: string
  transcript: string
  audioSrc: string
  captionsSrc: string
  durationSeconds: number
  origin: 'local-system-voice'
  voice: 'Nathan Enhanced'
  generatedAt: '2026-08-31'
}

export const GRIP_AUDIO_CUES: GripAudioCue[] = [
  {
    pitchSlug: 'four-seam',
    title: 'Four-seam grip cue',
    transcript:
      "Set your index and middle fingertips across the wide horseshoe seam. Rest the thumb beneath the ball, centered and light. This is Austin's hold, not a universal rule.",
    audioSrc: '/narration/four-seam-5e4a6047.m4a',
    captionsSrc: '/narration/four-seam-5e4a6047.vtt',
    durationSeconds: 9.3,
    origin: 'local-system-voice',
    voice: 'Nathan Enhanced',
    generatedAt: '2026-08-31',
  },
  {
    pitchSlug: 'two-seam',
    title: 'Two-seam grip cue',
    transcript:
      "Run the index and middle fingers with the two narrow seams, like rails. Brace the thumb underneath and keep the ball comfortably seated. This is Austin's own grip cue.",
    audioSrc: '/narration/two-seam-b172d1eb.m4a',
    captionsSrc: '/narration/two-seam-b172d1eb.vtt',
    durationSeconds: 9.3,
    origin: 'local-system-voice',
    voice: 'Nathan Enhanced',
    generatedAt: '2026-08-31',
  },
  {
    pitchSlug: 'twelve-six',
    title: '12-6 curve grip cue',
    transcript:
      "Set two fingers together against one long seam, with the thumb supporting underneath. Notice the grip shape before thinking about movement. This is Austin's photographed hold.",
    audioSrc: '/narration/twelve-six-40030fb3.m4a',
    captionsSrc: '/narration/twelve-six-40030fb3.vtt',
    durationSeconds: 10,
    origin: 'local-system-voice',
    voice: 'Nathan Enhanced',
    generatedAt: '2026-08-31',
  },
  {
    pitchSlug: 'three-finger-change',
    title: 'Three-finger change grip cue',
    transcript:
      "Spread three fingers across the top of the ball and let the thumb support below. The wider contact softens Austin's hold without disguising it as a circle change.",
    audioSrc: '/narration/three-finger-change-17f9c166.m4a',
    captionsSrc: '/narration/three-finger-change-17f9c166.vtt',
    durationSeconds: 8.8,
    origin: 'local-system-voice',
    voice: 'Nathan Enhanced',
    generatedAt: '2026-08-31',
  },
]

export function gripAudioCueFor(pitchSlug: string): GripAudioCue | undefined {
  return GRIP_AUDIO_CUES.find((cue) => cue.pitchSlug === pitchSlug)
}

