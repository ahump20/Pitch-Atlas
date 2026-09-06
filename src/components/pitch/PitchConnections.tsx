import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { PitchAtlasEntry } from '../../data/types'
import { craftsmenForPitch } from '../../data/craftsmen'
import { accentForSlug } from '../refractor/accents'
import { ClaimProse } from '../provenance/ClaimProse'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { compareUrl, EMPTY_SELECTION } from '../compare/selection'

/*
  The connective tissue at the foot of a specimen: the arms who owned this pitch,
  and the pitch's own family around it. Both are read off the data — the masters
  by the same slug the craftsman chapters cross-link out by (so the link is
  genuinely two-way), the siblings by the pitch's filed family. A specimen with
  no filed master and no filed sibling shows nothing here rather than an empty
  rail. On the coal scene, so it reads bone-on-black like the rest of the page.
*/
export function PitchConnections({
  entry,
  accentColor,
  familyLabel,
  siblings,
}: {
  entry: PitchAtlasEntry
  accentColor: string
  familyLabel: string
  siblings: PitchAtlasEntry[]
}) {
  const masters = craftsmenForPitch(entry.display.slug)
  const companion = siblings[0]
  if (masters.length === 0 && siblings.length === 0) return null

  return (
    <section className="archive-connections border-t border-bone/8 py-12 md:py-16" aria-label="Connections">
      <div className="archive-connection-heading"><p className="archive-eyebrow">Keep following the pitch</p><h2>A hold is a beginning.</h2><p>Set another grip beside it, meet a practitioner, or add what you noticed to the conversation.</p></div>
      {companion && <div className="archive-companion">
        <div className="archive-companion-drawing" aria-hidden="true"><SeamSchematic grip={companion.canonical.gripModel.status === 'filed' ? companion.canonical.gripModel.contacts : undefined} surface="stage" showAxis={false} showStitches={false} title="" /></div>
        <div><p className="archive-eyebrow">Another {familyLabel.toLowerCase()} in the collection</p><h3>Set it beside the {companion.display.shortName.toLowerCase()}.</h3><ClaimProse claim={companion.canonical.grip} proseClassName="text-bone-2 text-[15px] leading-relaxed" /><Link className="archive-text-link" to={compareUrl({ ...EMPTY_SELECTION, a: entry.display.slug, b: companion.display.slug })}>Compare these two grips <span aria-hidden="true">→</span></Link></div>
      </div>}
      {masters.length > 0 ? (
        <div className="mb-12">
          <p className="rfx-skick" style={{ color: accentColor }}>
            {masters.length > 1 ? 'The people behind the pitch' : 'The person behind the pitch'}
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {masters.map((m) => {
              const mc = m.signaturePitchSlug ? accentForSlug(m.signaturePitchSlug).c3 : accentColor
              return (
                <Link
                  key={m.slug}
                  to={`/craftsmen/${m.slug}`}
                  className="rfx-plate group"
                  style={{ '--gc': mc } as CSSProperties}
                >
                  <span className="mono-label text-ink-3">{m.specimenNo} · {m.era}</span>
                  <h3 className="rfx-platetitle text-2xl">{m.name}</h3>
                  <p className="text-sm leading-relaxed text-bone-2">{m.tagline}</p>
                  <p className="mono-label mt-auto text-bone-2">
                    {m.signaturePitch}
                    <span className="ml-2 text-cyan transition-colors group-hover:text-bone">
                      Follow the story →
                    </span>
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}

      {siblings.length > 0 ? (
        <div>
          <p className="rfx-skick">Others in the {familyLabel.toLowerCase()}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {siblings.map((s) => {
              const sc = s.display.specimenNo === '00' ? '#caa14a' : accentForSlug(s.display.slug).c3
              return (
                <Link
                  key={s.display.slug}
                  to={`/pitch/${s.display.slug}`}
                  className="group inline-flex items-center gap-2.5 rounded-full border border-bone/15 py-2 pl-3 pr-4 transition-colors hover:border-bone/40"
                >
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 flex-none rounded-full"
                    style={{ background: sc, boxShadow: `0 0 6px ${sc}` }}
                  />
                  <span className="font-prose text-sm font-bold text-bone">{s.canonical.name}</span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] text-ink-3 transition-colors group-hover:text-cyan"
                  >
                    →
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}
    </section>
  )
}
