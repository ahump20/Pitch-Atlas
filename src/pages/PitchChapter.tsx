import { type CSSProperties, type ReactNode, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import type {
  MasterVariantRecord,
  PitchAtlasEntry,
  PitchFamily,
  Source,
} from '../data/types'
import { PITCHES, pitchBySlug } from '../data/pitches'
import { SITE } from '../config/site'
import { canonicalUrl, ogImageMeta, contentJsonLd, truncateForMeta } from '../lib/seo'
import { StructuredData } from '../components/seo/StructuredData'
import { scrollToId } from '../lib/scroll'
import { GripViewer } from '../components/grip/GripViewer'
import { RefractorBall } from '../components/refractor/RefractorBall'
import { GripClip } from '../components/refractor/GripClip'
import { GripFace } from '../components/refractor/GripFace'
import { accentForSlug } from '../components/refractor/accents'
import { gripEntryFor } from '../data/grips'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { ConfidenceDot, RefractorClaim, RefractorSource } from '../components/provenance/RefractorClaim'
import { CONFIDENCE_COLOR } from '../components/provenance/RefractorClaim'
import { CONFIDENCE_META } from '../data/types'
import { FieldNotes } from '../components/sections/FieldNotes'
import { DiscussionPanel } from '../components/sections/DiscussionPanel'
import { SpecimenGrips } from '../components/sections/GripLibrary'
import { PitchConnections } from '../components/pitch/PitchConnections'
import { TeachingClipSection } from '../components/embeds/TikTokEmbed'
import { NotFound } from './NotFound'

/*
  One pitch, one page — the card opened up into a full chapter, in the refractor
  language. The hero echoes the specimen card (the same accent world, the gold 1/1
  for the four-seam), then the chapter flows Grip Lab -> Release Room -> Movement
  -> Master Files -> Colophon, each section sourced and confidence-dotted. The live
  3D ball is the actor in the Grip Lab; the hero carries the card's seam schematic.
  No player likeness ever; the ball is the subject. Foil is decoration; every
  reading is sourced.
*/

const FAMILY_LABEL: Record<PitchFamily, string> = {
  fastball: 'Fastball',
  breaking: 'Breaking',
  offspeed: 'Offspeed',
}

const BALL_DEPTH_LABEL: Record<string, string> = {
  'out-in-fingers': 'Out in the fingers',
  neutral: 'Neutral depth',
  'deep-in-hand': 'Deeper in the hand',
}
const FINGER_SPACING_LABEL: Record<string, string> = {
  touching: 'Fingers close',
  'slight-spread': 'Slight spread',
  wide: 'Wide spacing',
}

const PITCH_SLUG_ALIASES: Record<string, string> = {
  'twelve-six-curveball': 'twelve-six',
  '12-6-curveball': 'twelve-six',
  'split-finger-fastball': 'splitter',
}

/** A short shape label — the direction the pitch breaks, in words, never a number. */
function shapeLabel(entry: PitchAtlasEntry) {
  const m = entry.motion
  if (m.indeterminateBreak) return 'Erratic flutter'
  const v = m.verticalShape === 'ride' ? 'Rides' : m.verticalShape === 'drop' ? 'Drops' : 'Holds flat'
  const h =
    m.horizontalDir === 'arm-side' ? 'arm-side run' : m.horizontalDir === 'glove-side' ? 'glove-side sweep' : null
  return h ? `${v} · ${h}` : v
}

/** Collect every distinct cited source on the page for the colophon, in render order. */
function collectSources(entry: PitchAtlasEntry): Source[] {
  const out: Source[] = []
  const seen = new Set<string>()
  const add = (s?: Source) => {
    if (s && !seen.has(s.id)) {
      seen.add(s.id)
      out.push(s)
    }
  }
  const c = entry.canonical
  add(c.grip.source)
  c.gripDetails.forEach((d) => add(d.source))
  add(c.mechanics.source)
  add(c.voice?.source)
  const p = c.physics
  add(p.spinAxis.source)
  add(p.shape.source)
  add(p.teaching.source)
  entry.masterVariants.forEach((v) => {
    add(v.distinction.source)
    v.accolades?.forEach((n) => add(n.claim.source))
    add(v.quote?.source)
  })
  add(entry.seam.stitchCount.source)
  add(entry.seam.accuracyNote.source)
  return out
}

/* ── Hero: the card, opened. ─────────────────────────────────────────────── */
function ChapterHero({ entry }: { entry: PitchAtlasEntry }) {
  const { canonical, motion, display, guide } = entry
  const accent = accentForSlug(display.slug)
  const isGold = display.specimenNo === '00'
  const accentColor = isGold ? '#caa14a' : accent.c3
  const shape = canonical.physics.shape
  const pills = [FAMILY_LABEL[canonical.family], guide?.family, motion.forceLabel].filter(
    (p, i, a): p is string => Boolean(p) && a.indexOf(p) === i,
  )
  // The honest face hierarchy, at chapter scale: Austin's clip when the pitch is
  // game-day, his photo when it is situational, the seam schematic otherwise.
  const grip = gripEntryFor(display.slug)
  const heroClip = grip?.clip
  const heroPhoto = !heroClip ? grip?.photos[0] : undefined

  return (
    <section className="grid grid-cols-1 items-center gap-[clamp(24px,4vw,52px)] pt-3 pb-[clamp(34px,5vw,56px)] md:grid-cols-[0.92fr_1.08fr]">
      {/* framed stage */}
      <div
        className="relative mx-auto aspect-square w-full max-w-[480px] overflow-hidden rounded-[24px]"
        style={{
          background: isGold
            ? 'radial-gradient(120% 100% at 50% 18%, rgba(202,161,74,0.20), transparent 60%), radial-gradient(120% 90% at 50% 30%, #2a1d05, #050309 82%)'
            : `radial-gradient(120% 100% at 50% 18%, color-mix(in srgb, ${accentColor} 18%, transparent), transparent 60%), radial-gradient(120% 90% at 50% 30%, color-mix(in srgb, ${accent.c2} 50%, #000), #050309 82%)`,
          boxShadow: `0 30px 60px -26px #000, 0 0 0 1px color-mix(in srgb, ${accentColor} 30%, transparent) inset, 0 0 0 3px color-mix(in srgb, ${accentColor} 18%, transparent)`,
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen"
          style={{
            background: `repeating-linear-gradient(45deg, color-mix(in srgb, ${accentColor} 50%, transparent) 0 1.5px, transparent 1.5px 14px), repeating-linear-gradient(-45deg, color-mix(in srgb, ${accentColor} 50%, transparent) 0 1.5px, transparent 1.5px 14px)`,
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[8%] rounded-full opacity-25"
          style={{
            background: `conic-gradient(from 0deg, transparent, color-mix(in srgb, ${accentColor} 40%, transparent), transparent 38%)`,
            mask: 'radial-gradient(closest-side, transparent 80%, #000 81%)',
            WebkitMask: 'radial-gradient(closest-side, transparent 80%, #000 81%)',
            animation: 'rfx-spin 20s linear infinite',
          }}
        />
        {isGold ? (
          <span
            className="absolute left-3.5 top-3.5 z-10 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#2a1d05]"
            style={{ background: 'var(--gold)' }}
          >
            Gold · 1 of 1 · Reference
          </span>
        ) : null}
        {heroClip ? (
          <GripClip clip={heroClip} priority />
        ) : heroPhoto ? (
          <GripFace photo={heroPhoto} priority />
        ) : (
          <div className="relative z-[1] h-full w-full p-[6%]">
            <RefractorBall spinAxis={motion.spinAxis} gyro={motion.gyro} accent={accent} id={`hero-${display.slug}`} showHalo />
          </div>
        )}
        {heroClip || heroPhoto ? (
          <span className="absolute bottom-3.5 left-3.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bone backdrop-blur-sm">
            <i className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden="true" />
            Austin&rsquo;s grip{heroClip ? ' · in motion' : ''}
          </span>
        ) : null}
      </div>

      {/* meta */}
      <div>
        <p className="rfx-athletic rfx-skew text-[18px]" style={{ color: accentColor }}>
          Archive file · Specimen No. {display.specimenNo}
        </p>
        <h1
          className="rfx-athletic rfx-skew rfx-stroke mt-2 text-bone leading-[0.95] [text-wrap:balance]"
          style={{ fontSize: 'clamp(40px,7vw,82px)' }}
        >
          {canonical.name}
        </h1>
        <p className="rfx-athletic rfx-skew mt-2.5 text-[clamp(15px,2vw,19px)] leading-[1.18] [text-wrap:balance]" style={{ color: accentColor }}>
          {guide?.tagline ?? display.heroSub}
        </p>
        <p className="mt-4 max-w-[50ch] border-l-2 pl-4 text-[13.5px] leading-relaxed text-bone-2" style={{ borderColor: `color-mix(in srgb, ${accentColor} 46%, transparent)` }}>
          Open this like an archive drawer: grip first, source attached, shape in words, no invented
          spin or movement numbers. The file exists so the hold can keep moving forward.
        </p>

        <div
          className="rfx-readplate relative mt-[18px] rounded-2xl p-4"
          style={{
            '--c3': accentColor,
            background: `linear-gradient(145deg, color-mix(in srgb, ${accentColor} 18%, #0B0805), #070503)`,
            border: `1px solid color-mix(in srgb, ${accentColor} 26%, transparent)`,
            boxShadow: `inset 0 1px 0 color-mix(in srgb, ${accentColor} 22%, transparent)`,
          } as CSSProperties}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: accentColor }}>
            Shape read
          </span>
          <p className="rfx-athletic rfx-skew mt-2 max-w-[34ch] text-[clamp(22px,3vw,34px)] leading-[1.05] text-bone">
            {shapeLabel(entry)}
          </p>
          <p className="mt-3 max-w-[48ch] text-[13px] leading-relaxed text-bone-2">{shape.value}</p>
          <span className="mt-3 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-bone-2">
            Shape
            <ConfidenceDot confidence={shape.confidence} />
          </span>
        </div>

        <p className="mt-4 max-w-[48ch] text-[14.5px] leading-relaxed text-bone-2">{canonical.grip.value}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {pills.map((p, i) => (
            <span
              key={p}
              className="rounded-full px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em]"
              style={
                i === 0 && isGold
                  ? { background: 'var(--gold)', color: '#2a1d05' }
                  : { color: 'var(--color-bone-2)', border: `1px solid color-mix(in srgb, ${accentColor} 40%, transparent)` }
              }
            >
              {p}
            </span>
          ))}
        </div>

        <span className="mt-3.5 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-bone-2">
          Grip
          <ConfidenceDot confidence={canonical.grip.confidence} />
        </span>

        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href="#grip-lab"
            onClick={(e) => {
              e.preventDefault()
              scrollToId('grip-lab', true)
            }}
            className="inline-flex items-center gap-2 rounded-md px-5 py-3 font-mono text-sm font-bold uppercase tracking-wide text-[#06121b] transition-transform active:translate-y-px"
            style={{ background: accentColor, boxShadow: `0 6px 20px -8px ${accentColor}` }}
          >
            Open the grip file <span aria-hidden="true">↓</span>
          </a>
          <Link
            to="/repertoire"
            className="inline-flex items-center gap-2 rounded-md border border-bone/30 px-5 py-3 font-mono text-sm uppercase tracking-wide text-bone transition-colors hover:border-bone"
          >
            All pitches <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── shared section scaffold ─────────────────────────────────────────────── */
function SectionHead({
  kicker,
  title,
  accentColor,
  children,
}: {
  kicker: string
  title: ReactNode
  accentColor: string
  children?: ReactNode
}) {
  return (
    <div>
      <p className="rfx-skick" style={{ color: accentColor }}>
        {kicker}
      </p>
      <h2 className="rfx-stitle mt-3 text-[clamp(26px,4.4vw,46px)]">{title}</h2>
      {children}
    </div>
  )
}

/* ── Grip Lab: the specimen hand on the ball + the sourced hold. ─────────── */
function GripLabSection({ entry, accentColor }: { entry: PitchAtlasEntry; accentColor: string }) {
  const { canonical, guide } = entry
  const [activeContact, setActiveContact] = useState<string | undefined>(undefined)
  const unfiled = canonical.gripModel.status === 'unfiled'

  return (
    <section id="grip-lab" className="scroll-mt-20 border-t border-bone/8 py-[clamp(34px,5vw,64px)]">
      <SectionHead
        kicker="Archive Drawer / Grip Lab"
        title={unfiled ? 'No one hold owns this pitch' : 'The artifact in the hand'}
        accentColor={accentColor}
      >
        <p className="mt-3.5 max-w-[62ch] text-[15px] leading-relaxed text-bone-2">
          {unfiled
            ? 'This pitch has no canonical grip to draw. The panel shows what the sources actually support, and nothing more.'
            : 'Lead with the hand. The fingers on the ball below are the sourced contacts, solved onto the seam. Drag the ball, or use the view buttons.'}
        </p>
      </SectionHead>

      <div className="mt-7 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-12">
        {/* the grip viewer: 3D hand, schematic fallback, or the unfiled state */}
        <div className="md:col-span-6">
          <GripViewer entry={entry} accentColor={accentColor} activeContact={activeContact} />
        </div>

        {/* steps + feel + grip facts */}
        <div className="flex flex-col gap-7 md:col-span-6">
          {guide ? (
            <ol className="flex flex-col gap-3">
              {guide.steps.map((step, i) => (
                <li key={i} className="rfx-panel grid grid-cols-[auto_1fr] items-start gap-3.5 rounded-[13px] px-4 py-3.5">
                  <span
                    className="rfx-athletic rfx-skew text-2xl leading-none"
                    style={{ color: accentColor }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[13.5px] leading-relaxed text-bone">{step}</span>
                </li>
              ))}
            </ol>
          ) : null}

          {guide ? (
            <div
              className="rounded-2xl p-[22px]"
              style={{
                background: `radial-gradient(100% 80% at 0% 0%, color-mix(in srgb, ${accentColor} 16%, transparent), transparent 60%), var(--color-press)`,
                border: `1px solid color-mix(in srgb, ${accentColor} 26%, transparent)`,
              }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: accentColor }}>
                What it should feel like
              </p>
              <p className="rfx-athletic rfx-skew mt-2 text-2xl text-bone">{guide.feel}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {canonical.gripModel.contacts.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onPointerEnter={() => setActiveContact(c.label)}
                    onPointerLeave={() => setActiveContact(undefined)}
                    className="rounded-lg border px-2.5 py-1.5 text-left font-mono text-[9px] uppercase tracking-[0.06em] text-bone-2 transition-colors"
                    style={{ background: '#14100A', borderColor: `color-mix(in srgb, ${accentColor} 30%, transparent)` }}
                  >
                    {c.label} · {c.pressureRole}
                  </button>
                ))}
              </div>
              <p
                className="mt-4 border-l-2 pl-3.5 font-mono text-[10px] leading-relaxed text-ink-3"
                style={{ borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)` }}
              >
                {canonical.gripModel.visualCaveat}
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div className="border-t border-bone/15 pt-3.5">
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-bone-2">Ball depth</p>
              <p className="text-[14px] text-bone">{BALL_DEPTH_LABEL[canonical.gripModel.ballDepth]}</p>
            </div>
            <div className="border-t border-bone/15 pt-3.5">
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-bone-2">Spacing</p>
              <p className="text-[14px] text-bone">{FINGER_SPACING_LABEL[canonical.gripModel.fingerSpacing]}</p>
            </div>
          </div>

          <details className="group border-t border-bone/15 pt-5">
            <summary className="disclosure-row flex cursor-pointer list-none items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-bone-2 transition-colors hover:text-bone">
              <span aria-hidden="true" className="transition-transform group-open:rotate-90" style={{ color: accentColor }}>›</span>
              The sourced grip, in full
            </summary>
            <div className="disclose-body mt-5 flex flex-col gap-6">
              <RefractorClaim claim={canonical.grip} proseClassName="text-[15px] leading-relaxed text-bone" />
              <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                {canonical.gripDetails.map((d, i) => (
                  <RefractorClaim key={i} claim={d} proseClassName="text-[13.5px] leading-relaxed text-bone/85" />
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>
    </section>
  )
}

/* ── Release Room ────────────────────────────────────────────────────────── */
function ReleaseSection({ entry, accentColor }: { entry: PitchAtlasEntry; accentColor: string }) {
  const { canonical } = entry
  const gm = canonical.gripModel
  const sequence = [
    { label: 'Hold', copy: gm.palmGapCue },
    {
      label: 'Pressure',
      copy:
        gm.contacts.find((c) => c.finger === gm.primaryPressureFinger)?.pressureRole ?? gm.thumbRole,
    },
    { label: 'Leave', copy: gm.releaseCue },
  ]
  return (
    <section className="border-t border-bone/8 py-[clamp(34px,5vw,64px)]">
      <SectionHead kicker="Release Room" title="Translate the hold into a release" accentColor={accentColor}>
        <p className="mt-3.5 max-w-[62ch] text-[15px] leading-relaxed text-bone-2">
          Grip shape only matters if the release makes sense. Read pressure, thumb support, and ball depth
          before you read the pitch shape.
        </p>
      </SectionHead>

      <div className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {sequence.map((s, i) => (
          <article key={s.label} className="rfx-panel rounded-[14px] p-5">
            <span className="font-mono text-xs tabular-nums" style={{ color: accentColor }}>
              0{i + 1}
            </span>
            <h3 className="rfx-athletic rfx-skew mt-2 text-xl text-bone">{s.label}</h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-bone-2">{s.copy}</p>
          </article>
        ))}
      </div>

      <div className="mt-8">
        <RefractorClaim claim={canonical.mechanics} proseClassName="text-[15px] leading-relaxed text-bone" />
      </div>
    </section>
  )
}

/* ── Movement: shape + the one teaching sentence. ────────────────────────── */
function MovementSection({ entry, accentColor }: { entry: PitchAtlasEntry; accentColor: string }) {
  const { canonical, display } = entry
  const p = canonical.physics

  return (
    <section className="border-t border-bone/8 py-[clamp(34px,5vw,64px)]">
      <SectionHead kicker="Movement" title={display.foundationCaption} accentColor={accentColor}>
        <p className="mt-3.5 max-w-[62ch] text-[15px] leading-relaxed text-bone-2">
          The read is shape, not a gauge. The spin words explain why it moves that way, and every prose
          claim still carries its source.
        </p>
      </SectionHead>

      <div className="mt-7 grid grid-cols-1 gap-3.5 md:grid-cols-12">
        <div
          className="rounded-[16px] p-6 md:col-span-5"
          style={{
            background: `radial-gradient(120% 100% at 0% 0%, color-mix(in srgb, ${accentColor} 16%, transparent), transparent 60%), var(--color-press)`,
            border: `1px solid color-mix(in srgb, ${accentColor} 28%, transparent)`,
          }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-2">Shape</p>
          <p className="rfx-athletic rfx-skew mt-2 text-[clamp(24px,4vw,42px)] leading-[1.02] text-bone">
            {shapeLabel(entry)}
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-bone-2">{p.shape.value}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <ConfidenceDot confidence={p.shape.confidence} />
            {p.shape.source ? (
              <>
                <span aria-hidden="true" className="text-ink-3">/</span>
                <RefractorSource source={p.shape.source} />
              </>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 md:col-span-7">
          <div className="rfx-panel rounded-[14px] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-2">Spin words</p>
            <p className="mt-2 text-[13px] leading-relaxed text-bone">{p.spinAxis.value}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <ConfidenceDot confidence={p.spinAxis.confidence} />
              {p.spinAxis.source ? (
                <>
                  <span aria-hidden="true" className="text-ink-3">/</span>
                  <RefractorSource source={p.spinAxis.source} />
                </>
              ) : null}
            </div>
          </div>
          <div className="rfx-panel rounded-[14px] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-2">Craft read</p>
            <p className="mt-2 text-[13px] leading-relaxed text-bone">{entry.guide?.does.plain ?? p.shape.value}</p>
          </div>
        </div>
      </div>

      {/* the one teaching sentence */}
      <div
        className="mt-5 rounded-[14px] p-6"
        style={{
          background: `radial-gradient(120% 100% at 100% 0%, color-mix(in srgb, ${accentColor} 14%, transparent), transparent 60%), var(--color-press)`,
          border: `1px solid color-mix(in srgb, ${accentColor} 26%, transparent)`,
        }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: accentColor }}>
          The one teaching sentence
        </p>
        <p className="rfx-athletic rfx-skew mt-2.5 max-w-[40ch] text-[clamp(18px,2.4vw,26px)] leading-[1.05] text-bone">
          {p.teaching.value}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <ConfidenceDot confidence={p.teaching.confidence} />
          {p.teaching.source ? (
            <>
              <span aria-hidden="true" className="text-ink-3">/</span>
              <RefractorSource source={p.teaching.source} />
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/* ── Master Files ────────────────────────────────────────────────────────── */
function MasterCard({ variant, accentColor }: { variant: MasterVariantRecord; accentColor: string }) {
  return (
    <article
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: `linear-gradient(165deg, color-mix(in srgb, ${accentColor} 18%, #0B0805), #070503)`,
        border: `1px solid color-mix(in srgb, ${accentColor} 24%, transparent)`,
      }}
    >
      <h3 className="rfx-athletic rfx-skew text-2xl text-bone">{variant.pitcher}</h3>
      <p className="mt-2 text-[12.5px] leading-relaxed text-bone-2">{variant.context}</p>
      <div className="mt-4 border-t border-white/8 pt-4">
        <p className="text-[13px] leading-relaxed text-bone">{variant.distinction.value}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <ConfidenceDot confidence={variant.distinction.confidence} />
          {variant.distinction.source ? (
            <>
              <span aria-hidden="true" className="text-ink-3">/</span>
              <RefractorSource source={variant.distinction.source} />
            </>
          ) : null}
        </div>
      </div>
      {variant.accolades && variant.accolades.length > 0 ? (
        <div className="mt-4">
          {variant.accolades.map((n) => (
            <div key={n.label} className="border-t border-white/8 py-2">
              <p className="text-[12.5px] leading-relaxed text-bone-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-ink-3">
                  {n.label}
                  {' · '}
                </span>
                {n.claim.value}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <ConfidenceDot confidence={n.claim.confidence} />
                {n.claim.source ? (
                  <>
                    <span aria-hidden="true" className="text-ink-3">/</span>
                    <RefractorSource source={n.claim.source} />
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {variant.quote?.source ? (
        <figure className="mt-4 border-t border-white/8 pt-4">
          <blockquote className="rfx-athletic rfx-skew text-[15px] leading-snug text-bone">
            {variant.quote.value}
          </blockquote>
          <figcaption className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <ConfidenceDot confidence={variant.quote.confidence} />
            <span aria-hidden="true" className="text-ink-3">/</span>
            <RefractorSource source={variant.quote.source} />
          </figcaption>
        </figure>
      ) : null}
    </article>
  )
}

function MasterFilesSection({ entry, accentColor }: { entry: PitchAtlasEntry; accentColor: string }) {
  const { masterVariants, display } = entry
  return (
    <section className="border-t border-bone/8 py-[clamp(34px,5vw,64px)]">
      <SectionHead kicker="Master Files" title="Three ways the same pitch wins" accentColor={accentColor}>
        <p className="mt-3.5 max-w-[62ch] text-[15px] leading-relaxed text-bone-2">{display.mastersIntro}</p>
      </SectionHead>

      {masterVariants.length > 0 ? (
        <div className="mt-7 grid grid-cols-1 gap-3.5 md:grid-cols-3">
          {masterVariants.map((v) => (
            <MasterCard key={v.pitcher} variant={v} accentColor={accentColor} />
          ))}
        </div>
      ) : (
        <div className="mt-7 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-bone/20 px-6 py-14 text-center">
          <img src="/brand/seal-128.webp" alt="" width={56} height={56} loading="lazy" decoding="async" className="opacity-80" aria-hidden="true" />
          <p className="max-w-[46ch] text-[14px] leading-relaxed text-bone-2">
            No master files for this pitch yet. A master is filed only when a named arm and a cited source
            both exist. Nothing is added to fill the page.
          </p>
        </div>
      )}
    </section>
  )
}

/* ── Colophon ────────────────────────────────────────────────────────────── */
function ColophonSection({ entry, accentColor }: { entry: PitchAtlasEntry; accentColor: string }) {
  const sources = collectSources(entry)
  const tiers = ['official-data', 'pitcher-own-words', 'coach-observed', 'reputable-analysis', 'secondhand-attributed'] as const
  return (
    <section className="border-t border-bone/8 py-[clamp(34px,5vw,64px)]">
      <SectionHead kicker="The colophon" title="Every claim, sourced" accentColor={accentColor}>
        <p className="mt-3.5 max-w-[62ch] text-[15px] leading-relaxed text-bone-2">
          Nothing here is marked right or wrong. It is marked by where it came from and how confident the
          source is. A broken citation throws at build, so a dead source never reaches you.
        </p>
      </SectionHead>

      <div className="rfx-panel mt-7 rounded-2xl p-[clamp(22px,3vw,32px)]">
        <ol className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {sources.map((s, i) => (
            <li key={s.id} className="flex items-baseline gap-2.5 text-[12px] text-bone-2">
              <span className="font-mono text-[8px] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
              <RefractorSource source={s} />
            </li>
          ))}
        </ol>
        <div className="mt-5 flex flex-wrap gap-x-3.5 gap-y-2 border-t border-white/8 pt-4">
          {tiers.map((t) => (
            <span key={t} className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.06em] text-bone-2">
              <i className="rfx-dot" style={{ background: CONFIDENCE_COLOR[t], color: CONFIDENCE_COLOR[t] }} aria-hidden="true" />
              {CONFIDENCE_META[t].label}
            </span>
          ))}
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
          {entry.seam.stitchCount.value} · {entry.seam.accuracyLevel} · as of the dates above
        </p>
      </div>
    </section>
  )
}

/* ── Pager ───────────────────────────────────────────────────────────────── */
function Pager({ prev, next }: { prev?: PitchAtlasEntry; next?: PitchAtlasEntry }) {
  return (
    <nav aria-label="Pitch chapters" className="grid grid-cols-1 gap-4 border-t border-bone/10 py-12 md:grid-cols-3">
      <div className="md:justify-self-start">
        {prev ? (
          <Link to={`/pitch/${prev.display.slug}`} className="group flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">← Previous specimen</span>
            <span className="rfx-athletic rfx-skew text-lg text-bone transition-colors group-hover:text-cyan">
              {prev.canonical.name}
            </span>
          </Link>
        ) : null}
      </div>
      <Link
        to="/craftsmen"
        className="flex flex-col items-center justify-center gap-1 rounded-md border border-bone/20 px-4 py-3 text-center transition-colors hover:border-cyan md:justify-self-center"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-cyan">The Craftsmen</span>
        <span className="text-sm text-bone-2">The arms who defined the craft →</span>
      </Link>
      <div className="md:justify-self-end">
        {next ? (
          <Link to={`/pitch/${next.display.slug}`} className="group flex flex-col gap-1 text-right">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">Next specimen →</span>
            <span className="rfx-athletic rfx-skew text-lg text-bone transition-colors group-hover:text-cyan">
              {next.canonical.name}
            </span>
          </Link>
        ) : null}
      </div>
    </nav>
  )
}

export function PitchChapter() {
  const { slug } = useParams<{ slug: string }>()
  const canonicalSlug = slug ? PITCH_SLUG_ALIASES[slug] ?? slug : undefined
  const entry = canonicalSlug ? pitchBySlug(canonicalSlug) : undefined

  const idx = entry ? PITCHES.findIndex((p) => p.display.slug === entry.display.slug) : -1
  const prev = idx > 0 ? PITCHES[idx - 1] : undefined
  const next = idx >= 0 && idx < PITCHES.length - 1 ? PITCHES[idx + 1] : undefined

  useSeoMeta(
    entry
      ? {
          title: `${entry.canonical.name}: grip, release, and movement | ${SITE.siteName}`,
          description: truncateForMeta(
            `${entry.display.heroIntro} ${entry.masterVariants.length} sourced master files.`,
          ),
          ogTitle: `${entry.canonical.name} | ${SITE.siteName}`,
          ogDescription: entry.display.heroIntro,
          ogUrl: canonicalUrl('/pitch/' + entry.display.slug),
          ...ogImageMeta('repertoire', `${entry.canonical.name} — grip, release, and movement`),
        }
      : { title: `Pitch not found | ${SITE.siteName}` },
  )

  if (!entry) return <NotFound />
  if (slug && canonicalSlug && slug !== canonicalSlug) return <Navigate to={`/pitch/${canonicalSlug}`} replace />

  const isGold = entry.display.specimenNo === '00'
  const accentColor = isGold ? '#caa14a' : accentForSlug(entry.display.slug).c3
  const gripEntry = gripEntryFor(entry.display.slug)
  // siblings: every other filed specimen in the same family, in filed order
  const siblings = PITCHES.filter(
    (p) => p.canonical.family === entry.canonical.family && p.display.slug !== entry.display.slug,
  )

  return (
    <div className="scene-coal">
    <StructuredData
      graph={contentJsonLd({
        type: 'CreativeWork',
        url: canonicalUrl('/pitch/' + entry.display.slug),
        name: `${entry.canonical.name}: grip, release, and movement`,
        description: entry.display.heroIntro,
        breadcrumb: [
          { name: 'Pitch Atlas', to: '/' },
          { name: 'Pitch Index', to: '/repertoire' },
          { name: entry.canonical.name },
        ],
      })}
    />
    <div className="mx-auto max-w-[1140px] px-5 md:px-8">
      <div className="pt-6">
        <Breadcrumb
          trail={[
            { label: 'Pitch Atlas', to: '/' },
            { label: 'Pitch Index', to: '/repertoire' },
            { label: entry.canonical.name },
          ]}
        />
      </div>
      <ChapterHero entry={entry} />
      <GripLabSection entry={entry} accentColor={accentColor} />
      <SpecimenGrips entry={gripEntry} accentColor={accentColor} />
      <ReleaseSection entry={entry} accentColor={accentColor} />
      <MovementSection entry={entry} accentColor={accentColor} />
      <TeachingClipSection slug={entry.display.slug} accentColor={accentColor} />
      <MasterFilesSection entry={entry} accentColor={accentColor} />
      <ColophonSection entry={entry} accentColor={accentColor} />
      <PitchConnections
        entry={entry}
        accentColor={accentColor}
        familyLabel={FAMILY_LABEL[entry.canonical.family]}
        siblings={siblings}
      />
      <div className="border-t border-bone/8 pt-8">
        <FieldNotes entry={entry} />
        <DiscussionPanel topicKey={entry.display.slug} topicName={entry.canonical.name} />
      </div>
      <Pager prev={prev} next={next} />
    </div>
    </div>
  )
}
