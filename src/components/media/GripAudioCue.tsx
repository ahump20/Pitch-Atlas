import { gripAudioCueFor } from '../../data/media/grip-cues'

export function GripAudioCue({ pitchSlug, accentColor }: { pitchSlug: string; accentColor: string }) {
  const cue = gripAudioCueFor(pitchSlug)
  if (!cue) return null

  return (
    <aside className="rfx-panel mt-7 rounded-[14px] p-5" aria-labelledby={`${cue.pitchSlug}-audio-title`}>
      <div className="grid gap-5 md:grid-cols-[minmax(0,0.8fr)_minmax(280px,1.2fr)] md:items-center">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: accentColor }}>
            Optional narrated cue · {cue.durationSeconds.toFixed(1)} seconds
          </p>
          <h3 id={`${cue.pitchSlug}-audio-title`} className="rfx-athletic rfx-skew mt-2 text-2xl text-bone">
            {cue.title}
          </h3>
          <p className="mt-2 text-[12px] leading-relaxed text-bone-2">
            Tap play when you want it. Audio never starts on its own.
          </p>
        </div>
        <audio className="w-full accent-cyan" controls preload="none" aria-label={cue.title}>
          <source src={cue.audioSrc} type="audio/mp4" />
          <track kind="captions" src={cue.captionsSrc} srcLang="en" label="English" default />
          Your browser does not support audio playback. The transcript follows.
        </audio>
      </div>
      <details className="group mt-5 border-t border-bone/12 pt-4">
        <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.12em] text-bone-2 hover:text-bone">
          Read synchronized transcript
        </summary>
        <p className="mt-3 max-w-[74ch] text-[13.5px] leading-relaxed text-bone-2">{cue.transcript}</p>
      </details>
    </aside>
  )
}

