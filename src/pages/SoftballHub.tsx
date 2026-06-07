import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { SOFTBALL_PITCHES, SOFTBALL_CRAFTSMEN } from '../data/softball'
import type { SoftballPitch } from '../data/softball'
import type { Craftsman } from '../data/types'
import { accentForSlug } from '../components/refractor/accents'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { StageTierMarker } from '../components/layout/StageTierMarker'

/*
  The Softball hub: the front door to the new wing. It is a soft launch and says so.
  Every sub-route is linked from here on purpose — the static build crawls links to
  prerender, so the hub is what makes the fastpitch page, the pitch chapters, the
  slowpitch sketch, and Cat Osterman's file render as real HTML. Fastpitch leads;
  slowpitch is filed honestly and lighter.
*/

const FAMILY_LABEL: Record<SoftballPitch['family'], string> = {
  rise: 'Rise',
  drop: 'Drop',
  fastball: 'Fastball',
  breaking: 'Breaking',
  offspeed: 'Off-speed',
}

function CornerMarks() {
  return (
    <>
      <span aria-hidden="true" className="absolute left-2.5 top-2.5 h-3 w-3 border-l border-t border-white/15" />
      <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-3 w-3 border-r border-t border-white/15" />
    </>
  )
}

function PitchPlate({ pitch }: { pitch: SoftballPitch }) {
  const gc = accentForSlug(pitch.slug).c3
  return (
    <Link
      to={`/softball/pitch/${pitch.slug}`}
      className={`rfx-plate group ${pitch.flagship ? 'is-edge' : ''}`}
      style={{ '--gc': gc } as CSSProperties}
    >
      <CornerMarks />
      <div className="flex items-center justify-between gap-3">
        <span className="mono-label" style={{ color: gc }}>
          {FAMILY_LABEL[pitch.family]} · {pitch.specimenNo}
        </span>
        {pitch.flagship ? <span className="mono-label text-powder">Flagship</span> : null}
      </div>
      <h3 className="rfx-platetitle text-2xl">{pitch.name}</h3>
      <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-bone-2">{pitch.tagline}</p>
      <div className="mt-auto flex items-center gap-x-3 border-t border-white/10 pt-3">
        <span className="mono-label text-ink-3">{pitch.velocity ?? 'Sourced'}</span>
        <span className="ml-auto mono-label text-cyan transition-colors group-hover:text-bone">Open →</span>
      </div>
    </Link>
  )
}

function CraftsmanPlate({ craftsman }: { craftsman: Craftsman }) {
  return (
    <Link
      to={`/softball/craftsmen/${craftsman.slug}`}
      className="rfx-plate group"
      style={{ '--gc': accentForSlug(craftsman.signaturePitchSlug ?? '').c3 } as CSSProperties}
    >
      <CornerMarks />
      <div className="flex items-center justify-between gap-3">
        <span className="mono-label text-powder">Master · {craftsman.specimenNo}</span>
        <span className="mono-label text-ink-3">{craftsman.era}</span>
      </div>
      <h3 className="rfx-platetitle text-2xl">{craftsman.name}</h3>
      <p className="mono-label mt-1 text-bone-2">{craftsman.signaturePitch}</p>
      <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-bone-2">{craftsman.tagline}</p>
      <div className="mt-auto flex items-center gap-x-3 border-t border-white/10 pt-3">
        <span className="mono-label text-cyan transition-colors group-hover:text-bone">Open the file →</span>
        {craftsman.hand ? (
          <>
            <span aria-hidden="true" className="text-ink-3">·</span>
            <span className="mono-label text-ink-3">{craftsman.hand}-handed</span>
          </>
        ) : null}
      </div>
    </Link>
  )
}

function StartPlate({
  to,
  eyebrow,
  title,
  blurb,
  gc,
}: {
  to: string
  eyebrow: string
  title: string
  blurb: string
  gc: string
}) {
  return (
    <Link to={to} className="rfx-plate group is-edge" style={{ '--gc': gc } as CSSProperties}>
      <CornerMarks />
      <p className="mono-label" style={{ color: gc }}>{eyebrow}</p>
      <h3 className="rfx-platetitle text-2xl">{title}</h3>
      <p className="text-[0.95rem] leading-relaxed text-bone-2">{blurb}</p>
      <div className="mt-auto flex items-center gap-x-3 border-t border-white/10 pt-3">
        <span className="ml-auto mono-label text-cyan transition-colors group-hover:text-bone">Open →</span>
      </div>
    </Link>
  )
}

export function SoftballHub() {
  useSeoMeta({
    title: `Softball: the circle enters the atlas | ${SITE.siteName}`,
    description:
      'The softball wing of Pitch Atlas — the underhand windmill craft, the fastpitch arsenal led by the riseball, the honest physics behind the rise, and Cat Osterman as the anchor. Fastpitch first; slowpitch sketched. Sourced, not corrected.',
    ogTitle: `Softball | ${SITE.siteName}`,
    ogDescription: 'The underhand craft, filed honestly. Fastpitch first, anchored on Cat Osterman.',
    ogUrl: `${SITE.canonicalDomain}/softball`,
  })

  return (
    <>
      <SectionHero
        breadcrumb={<Breadcrumb trail={[{ label: 'The Atlas', to: '/' }, { label: 'Softball' }]} />}
        eyebrow="The circle · soft launch"
        title="Softball enters the atlas."
        sub={
          <>
            A different craft from the baseball game: the underhand windmill, a kinetic chain driven from the
            ground up, and pitches with no baseball cousin — the rise, the drop, the screw. We are building
            fastpitch first and deepest, with the riseball’s honest physics at the center, and Cat Osterman as
            the anchor. Slowpitch is filed honestly and lighter. Early innings — sourced, not corrected.
          </>
        }
      />

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <StageTierMarker index="S" label="Start here" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StartPlate
            to="/softball/fastpitch"
            eyebrow="Fastpitch · fundamentals"
            title="The windmill, from the ground up"
            blurb="The four phases of the delivery, where the speed actually comes from, and the honest arm-health reality the 'underhand is safe' myth gets wrong."
            gc="var(--color-cyan)"
          />
          <StartPlate
            to="/softball/slowpitch"
            eyebrow="Slowpitch · the craft of inches"
            title="Arc, spin, and placement"
            blurb="No windmill, no velocity, no rise — but a real craft of arc height, deadening spin, and placement to the mat. Filed honestly and lighter."
            gc="var(--color-seam-bright)"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <StageTierMarker index="01" label="The fastpitch arsenal" />
        <p className="mb-8 max-w-[64ch] text-base leading-relaxed text-bone-2">
          The pitches of the circle, filed light for the launch — the riseball leads, carrying the
          atlas’s honest answer to whether it actually rises.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SOFTBALL_PITCHES.map((p) => (
            <PitchPlate key={p.slug} pitch={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <StageTierMarker index="02" label="The craftsmen of the circle" />
        <p className="mb-8 max-w-[64ch] text-base leading-relaxed text-bone-2">
          The arms that defined fastpitch from inside the circle. Cat Osterman opens the wing — the
          softball case that command and spin beat velocity — with the legends behind her (Fernandez,
          Finch, Abbott) and the new wave already here (Canady, Kavan).
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SOFTBALL_CRAFTSMEN.map((c) => (
            <CraftsmanPlate key={c.slug} craftsman={c} />
          ))}
        </div>
      </section>
    </>
  )
}
