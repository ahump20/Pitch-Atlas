import { type ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import type { GripView, VisualReference } from '../../data/types'
import { AUSTIN_GRIPS, ATTACK_PLAN, CIRCLE_CHANGE_DISTINCTION, GRIP_LIBRARY_INTRO, GRIP_LIBRARY_ARSENAL, GRIP_LIBRARY_COMMAND_NOTE } from '../../data/grips'
import type { GripLibraryEntry, GripClip } from '../../data/grips'
import { ConfidenceDot } from '../provenance/RefractorClaim'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/*
  The visual grip library, refractor-native. Every card is a real photograph of
  one grip in Austin's hand (first-party, owned outright), captioned in his own
  words. The ball is still the artifact — here it is the real ball, not the
  schematic — and no third party is in frame. Four states are honored by
  construction: the data is static so there is no loading/empty/fetch state, and a
  broken or missing asset falls back to a labeled tile (the error state) instead
  of a blank box — with a one-tap retry when there is a src worth re-requesting.
  Every image carries alt text, so the zero-WebGL/accessibility floor holds. The
  same GripPhoto card is reused inline on the specimen pages.
*/

const VIEW_LABEL: Record<GripView, string> = { top: 'Top', side: 'Side', thumb: 'Underside' }

const KIND_LABEL: Record<VisualReference['kind'], string> = {
  'first-party': 'Original',
  community: 'Community',
  'creative-commons': 'Creative Commons',
  'public-domain': 'Public domain',
  licensed: 'Licensed',
}

type GripImageState = 'loading' | 'loaded' | 'error'

export function GripPhoto({ photo, className = '' }: { photo: VisualReference; className?: string }) {
  const [state, setState] = useState<GripImageState>('loading')
  // bumping the attempt remounts the img, which re-requests the same src
  const [attempt, setAttempt] = useState(0)
  const failed = state === 'error'
  const credit = [KIND_LABEL[photo.kind], photo.attribution, photo.capturedAt?.slice(0, 4)]
    .filter(Boolean)
    .join(' · ')

  return (
    <figure className={`overflow-hidden rounded-[14px] border border-bone/12 bg-[#0B0805] ${className}`}>
      <div className="relative aspect-[4/3] w-full">
        {state === 'loading' ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 animate-pulse"
            style={{
              background:
                'linear-gradient(120deg, rgba(255,255,255,0.04), rgba(55,214,255,0.14), rgba(255,255,255,0.035))',
            }}
          />
        ) : null}
        {photo.src && !failed ? (
          <img
            key={attempt}
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            // a cached image can finish before hydration attaches onLoad — read it off the element
            ref={(el) => {
              if (el?.complete && el.naturalWidth > 0) setState('loaded')
            }}
            onLoad={() => setState('loaded')}
            onError={() => setState('error')}
            className={`media-fade h-full w-full object-cover ${state === 'loaded' ? 'is-loaded' : ''}`}
          />
        ) : (
          <div
            role="status"
            aria-live="polite"
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center"
          >
            <img src="/brand/seal-128.webp" alt="" width={40} height={40} loading="lazy" decoding="async" className="opacity-70" aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">Grip photo unavailable</span>
            <span className="max-w-[28ch] text-[11px] leading-snug text-ink-3">{photo.alt}</span>
            {photo.src && failed ? (
              <button
                type="button"
                onClick={() => {
                  setState('loading')
                  setAttempt((n) => n + 1)
                }}
                className="mt-1 rounded-full border border-cyan/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-cyan transition-colors hover:border-cyan hover:text-bone"
              >
                Retry
              </button>
            ) : null}
          </div>
        )}
        {photo.view ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-bone backdrop-blur-sm">
            {VIEW_LABEL[photo.view]}
          </span>
        ) : null}
      </div>
      <figcaption className="flex flex-col gap-2 px-3.5 py-3.5">
        <p className="text-[13px] leading-relaxed text-bone-2">{photo.caption}</p>
        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-ink-3">
          <i className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden="true" />
          {credit}
        </span>
      </figcaption>
    </figure>
  )
}

/** A looping grip video, framed like a GripPhoto — the moving evidence for a
    game-day pitch. Honors reduced motion by holding on the poster frame.
    `large` runs the clip at its native 9/16 portrait, uncropped, for the
    theater layout; the default 4/3 crop stays for inline card use. */
export function GripMotion({
  clip,
  className = '',
  large = false,
}: {
  clip: GripClip
  className?: string
  large?: boolean
}) {
  const reduced = useReducedMotion()
  // media settle: the window fades up when the first real frame lands
  const [settled, setSettled] = useState(false)
  const mediaClass = `media-fade h-full w-full object-cover ${settled ? 'is-loaded' : ''}`
  return (
    <figure className={`overflow-hidden rounded-[14px] border border-cyan/25 bg-[#0B0805] ${className}`}>
      <div className={`relative w-full ${large ? 'aspect-[9/16]' : 'aspect-[4/3]'}`}>
        {reduced ? (
          <img
            src={clip.poster}
            alt={clip.alt}
            loading="lazy"
            decoding="async"
            ref={(el) => {
              if (el?.complete && el.naturalWidth > 0) setSettled(true)
            }}
            onLoad={() => setSettled(true)}
            className={mediaClass}
          />
        ) : (
          <video
            className={mediaClass}
            poster={clip.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={clip.alt}
            onLoadedData={() => setSettled(true)}
            // a decode failure reveals the poster instead of holding the window dark
            onError={() => setSettled(true)}
          >
            <source src={clip.mp4} type="video/mp4" />
            <source src={clip.webm} type="video/webm" />
          </video>
        )}
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-bone backdrop-blur-sm">
          <i className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden="true" />
          Motion
        </span>
      </div>
      <figcaption className="flex flex-col gap-2 px-3.5 py-3.5">
        <p className="text-[13px] leading-relaxed text-bone-2">{clip.alt}</p>
        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-ink-3">
          <i className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden="true" />
          Original · Austin H.
        </span>
      </figcaption>
    </figure>
  )
}

function EvidenceLane({
  label,
  accentColor,
  children,
  confidence,
}: {
  label: string
  accentColor: string
  children: ReactNode
  confidence?: GripLibraryEntry['claimTier']
}) {
  return (
    <article
      className="rounded-[14px] border p-4"
      style={{
        borderColor: `color-mix(in srgb, ${accentColor} 24%, transparent)`,
        background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 8%, transparent), rgba(255,255,255,0.025))`,
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: accentColor }}>
        {label}
      </p>
      <div className="mt-2 flex flex-col gap-2 text-[13.5px] leading-relaxed text-bone-2">{children}</div>
      {confidence ? <ConfidenceDot confidence={confidence} className="mt-3" /> : null}
    </article>
  )
}

/** A specimen-page evidence section for Austin's real grip references. */
export function SpecimenGrips({
  entry,
  accentColor,
  className = '',
}: {
  entry?: GripLibraryEntry
  accentColor: string
  className?: string
}) {
  if (!entry) return null
  const photos = entry.photos

  return (
    <section
      id="grip-evidence"
      className={`scroll-mt-20 border-t border-bone/8 py-[clamp(34px,5vw,64px)] ${className}`}
      aria-labelledby={`${entry.id}-grip-evidence-title`}
    >
      <div className="grid grid-cols-1 gap-x-12 gap-y-7 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="rfx-skick" style={{ color: accentColor }}>
            Grip Evidence
          </p>
          <h2 id={`${entry.id}-grip-evidence-title`} className="rfx-stitle mt-3 text-[clamp(26px,4.4vw,46px)]">
            The photo can say this much
          </h2>
          <p className="mt-3.5 max-w-[62ch] text-[15px] leading-relaxed text-bone-2">
            This is the visual grip-reference layer for {entry.label}. It names visible placement and
            Austin's own feel notes, then stops before making measured claims.
          </p>
        </div>

        <div className="md:col-span-7">
          {entry.clip || photos.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entry.clip ? <GripMotion clip={entry.clip} /> : null}
              {photos.map((p) => (
                <GripPhoto key={p.src} photo={p} />
              ))}
            </div>
          ) : (
            <div
              className="rounded-[16px] border border-dashed px-5 py-8"
              style={{
                borderColor: `color-mix(in srgb, ${accentColor} 32%, transparent)`,
                background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 8%, transparent), rgba(255,255,255,0.025))`,
              }}
            >
              {entry.id === 'circle-change' ? (
                <>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: accentColor }}>
                    {CIRCLE_CHANGE_DISTINCTION.marker}
                  </p>
                  <p className="mt-2 max-w-[56ch] text-[14px] leading-relaxed text-bone-2">
                    {CIRCLE_CHANGE_DISTINCTION.reason}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: accentColor }}>
                    Empty gallery
                  </p>
                  <p className="mt-2 max-w-[56ch] text-[14px] leading-relaxed text-bone-2">
                    No Austin grip photo is attached to this pitch. The note below is intentionally text-only.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-3.5 md:grid-cols-3">
        <EvidenceLane label="Photo-supported grip cue" accentColor={accentColor}>
          <p>{entry.visibleCue}</p>
        </EvidenceLane>
        <EvidenceLane label="Pitcher's own words" accentColor={accentColor} confidence={entry.claimTier}>
          <p>{entry.note}</p>
          {entry.movement ? <p>{entry.movement}</p> : null}
        </EvidenceLane>
        <EvidenceLane label="Sourced public record" accentColor={accentColor}>
          <p>
            The existing official and cited claims stay in the page below with their original confidence labels.
            This photo does not upgrade or replace those sources.
          </p>
        </EvidenceLane>
      </div>

      <p
        className="mt-4 rounded-full border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.09em] text-ink-3"
        style={{
          borderColor: `color-mix(in srgb, ${accentColor} 24%, transparent)`,
          background: 'rgba(0,0,0,0.16)',
        }}
      >
        {entry.proofLimit}
      </p>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
        See every grip in the{' '}
        <Link to="/grips" className="text-cyan underline-offset-2 hover:underline">
          Grip Library
        </Link>
        .
      </p>
    </section>
  )
}

/** How he attacked hitters — the arsenal put to work, as a sequenced at-bat. */
export function AttackPlan() {
  return (
    <div>
      <p className="rfx-skick text-cyan">How he attacked hitters</p>
      <h2 className="rfx-stitle mt-3 text-[clamp(26px,4.4vw,46px)]">The grips, put to work</h2>
      <p className="mt-4 max-w-[74ch] text-[15.5px] leading-relaxed text-bone-2">{ATTACK_PLAN.intro}</p>

      <div className="mt-9 rounded-[16px] border border-bone/12 bg-press/60 p-[clamp(20px,3vw,30px)]">
        <p className="rfx-athletic rfx-skew text-2xl text-bone">{ATTACK_PLAN.sequenceTitle}</p>
        <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-bone-2">{ATTACK_PLAN.sequenceNote}</p>

        <ol className="mt-6 flex flex-col gap-3">
          {ATTACK_PLAN.sequence.map((step, i) => {
            const last = i === ATTACK_PLAN.sequence.length - 1
            return (
              <li
                key={step.label}
                className="grid grid-cols-[auto_1fr] items-start gap-4 rounded-[12px] border px-4 py-3.5"
                style={{
                  background: last ? 'color-mix(in srgb, var(--color-cyan) 12%, var(--color-press))' : 'var(--color-press)',
                  borderColor: last ? 'color-mix(in srgb, var(--color-cyan) 45%, transparent)' : 'rgba(246,241,230,0.10)',
                }}
              >
                <span
                  className="rfx-athletic rfx-skew text-2xl leading-none"
                  style={{ color: last ? 'var(--color-cyan)' : 'var(--color-amber)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-bone">
                    {step.label}
                    {last ? <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.12em] text-cyan">Putaway</span> : null}
                  </span>
                  <span className="mt-1 block text-[13.5px] leading-relaxed text-bone-2">{step.detail}</span>
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="mt-8 max-w-[74ch] border-t border-bone/10 pt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan">On command and the arm slot</p>
        <p className="mt-2 text-[15px] leading-relaxed text-bone-2">{GRIP_LIBRARY_COMMAND_NOTE}</p>
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
        Austin H. · a pitcher&rsquo;s own account, not tracked data
      </p>
    </div>
  )
}

/** The full library: the through-line, then each grip in Austin's own words. */
export function GripLibrary() {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <p className="max-w-[70ch] text-[16px] leading-relaxed text-bone-2">{GRIP_LIBRARY_INTRO}</p>
        <p className="max-w-[70ch] rounded-[12px] border border-bone/10 bg-press/60 px-5 py-4 text-[14px] leading-relaxed text-bone-2">
          {GRIP_LIBRARY_ARSENAL}
        </p>
      </div>

      {AUSTIN_GRIPS.map((grip) => {
        const link = grip.specimenSlug
          ? { to: `/pitch/${grip.specimenSlug}`, label: 'See the specimen' }
          : grip.repertoireId
            ? { to: `/repertoire/${grip.repertoireId}`, label: 'Open the file' }
            : null
        return (
          <article key={grip.id} className="border-t border-bone/10 pt-9">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
              <h2 className="rfx-stitle text-[clamp(24px,4vw,42px)]">{grip.label}</h2>
              {link ? (
                <Link
                  to={link.to}
                  className="font-mono text-[11px] uppercase tracking-[0.1em] text-cyan underline-offset-2 transition-opacity hover:opacity-70"
                >
                  {link.label} <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>

            <blockquote className="mt-4 max-w-[74ch] border-l-2 border-cyan/40 pl-4 text-[15.5px] leading-relaxed text-bone">
              {grip.note}
            </blockquote>
            <p className="mt-2 pl-4 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
              Austin H. · in his own words
            </p>

            {grip.movement ? (
              <div className="mt-5 max-w-[74ch] rounded-[12px] border-l-2 border-amber/50 bg-press/50 px-4 py-3.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber">How it moved</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-bone-2">{grip.movement}</p>
              </div>
            ) : null}

            {/* the theater band: the moving grip at its native portrait scale, the
                photo angles large beside it. No clip → the photos carry the band.
                Nothing at all → the labeled gap (the circle change), never a
                borrowed photo implying Austin's hand. */}
            {grip.clip || grip.photos.length > 0 ? (
              <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-12">
                {grip.clip ? (
                  <div className="lg:col-span-5">
                    <GripMotion clip={grip.clip} large />
                  </div>
                ) : null}
                <div className={grip.clip ? 'lg:col-span-7' : 'lg:col-span-12'}>
                  <div
                    className={
                      grip.clip
                        ? 'grid grid-cols-1 gap-5 sm:grid-cols-2'
                        : 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'
                    }
                  >
                    {grip.photos.map((p) => (
                      <GripPhoto key={p.src} photo={p} />
                    ))}
                  </div>
                </div>
              </div>
            ) : grip.id === 'circle-change' ? (
              <div className="mt-7 max-w-[74ch] rounded-[16px] border border-dashed border-bone/20 px-5 py-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                  {CIRCLE_CHANGE_DISTINCTION.marker}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-bone-2">
                  {CIRCLE_CHANGE_DISTINCTION.reason}
                </p>
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
