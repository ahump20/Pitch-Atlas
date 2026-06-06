import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { GripView, VisualReference } from '../../data/types'
import { AUSTIN_GRIPS, ATTACK_PLAN, GRIP_LIBRARY_INTRO, GRIP_LIBRARY_ARSENAL, GRIP_LIBRARY_COMMAND_NOTE } from '../../data/grips'

/*
  The visual grip library, refractor-native. Every card is a real photograph of
  one grip in Austin's hand (bsi-original, owned outright), captioned in his own
  words. The ball is still the artifact — here it is the real ball, not the
  schematic — and no third party is in frame. Four states are honored by
  construction: the data is static so there is no loading/empty/fetch state, and a
  broken or missing asset falls back to a labeled tile (the error state) instead
  of a blank box. Every image carries alt text, so the zero-WebGL/accessibility
  floor holds. The same GripPhoto card is reused inline on the specimen pages.
*/

const VIEW_LABEL: Record<GripView, string> = { top: 'Top', side: 'Side', thumb: 'Underside' }

const KIND_LABEL: Record<VisualReference['kind'], string> = {
  'bsi-original': 'Original',
  community: 'Community',
  'creative-commons': 'Creative Commons',
  'public-domain': 'Public domain',
  licensed: 'Licensed',
}

export function GripPhoto({ photo, className = '' }: { photo: VisualReference; className?: string }) {
  const [failed, setFailed] = useState(false)
  const credit = [KIND_LABEL[photo.kind], photo.attribution, photo.capturedAt?.slice(0, 4)]
    .filter(Boolean)
    .join(' · ')

  return (
    <figure className={`overflow-hidden rounded-[14px] border border-bone/12 bg-[#0a0810] ${className}`}>
      <div className="relative aspect-[4/3] w-full">
        {photo.src && !failed ? (
          <img
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
            <img src="/brand/seal-128.webp" alt="" width={40} height={40} loading="lazy" decoding="async" className="opacity-70" aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">Grip photo unavailable</span>
            <span className="max-w-[28ch] text-[11px] leading-snug text-ink-3">{photo.alt}</span>
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

/** A compact strip of the real grip photos for a specimen page. */
export function SpecimenGrips({ photos, accentColor }: { photos: VisualReference[]; accentColor: string }) {
  if (!photos.length) return null
  return (
    <section className="border-t border-bone/8 py-[clamp(34px,5vw,64px)]">
      <p className="rfx-skick" style={{ color: accentColor }}>
        From the hand
      </p>
      <h2 className="rfx-stitle mt-3 text-[clamp(26px,4.4vw,46px)]">The real grip, photographed</h2>
      <p className="mt-3.5 max-w-[62ch] text-[15px] leading-relaxed text-bone-2">
        The schematic above is tuned from sourced descriptions. These are the genuine article — one real grip
        in one real hand, our own photography, owned outright. Sourced, not corrected.
      </p>
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p) => (
          <GripPhoto key={p.src} photo={p} />
        ))}
      </div>
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
        Austin Humphrey · a pitcher&rsquo;s own account, not tracked data
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
              Austin Humphrey · in his own words
            </p>

            {grip.movement ? (
              <div className="mt-5 max-w-[74ch] rounded-[12px] border-l-2 border-amber/50 bg-press/50 px-4 py-3.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber">How it moved</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-bone-2">{grip.movement}</p>
              </div>
            ) : null}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grip.photos.map((p) => (
                <GripPhoto key={p.src} photo={p} />
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}
