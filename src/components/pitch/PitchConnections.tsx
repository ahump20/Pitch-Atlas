import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { PitchAtlasEntry } from '../../data/types'
import { craftsmenForPitch } from '../../data/craftsmen'
import { accentForSlug } from '../refractor/accents'

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
  if (masters.length === 0 && siblings.length === 0) return null

  return (
    <section className="border-t border-bone/8 py-12 md:py-16" aria-label="Connections">
      {masters.length > 0 ? (
        <div className="mb-12">
          <p className="rfx-skick" style={{ color: accentColor }}>
            {masters.length > 1 ? 'The arms who owned it' : 'The arm who owned it'}
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
                  <p className="mono-label mt-auto text-bone-2">
                    {m.signaturePitch}
                    <span className="ml-2 text-cyan transition-colors group-hover:text-bone">
                      Open the file →
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
