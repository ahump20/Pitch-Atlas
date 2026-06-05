import { Link } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { REPERTOIRE, REPERTOIRE_FAMILIES, repertoireByFamily } from '../data/repertoire'
import { RepertoireEntryCard } from '../components/repertoire/RepertoireEntryCard'
import { TierMarker } from '../components/layout/TierMarker'

/*
  The Repertoire: every accepted pitch, by family. Not thirty-two filed specimens —
  filing a specimen means measured geometry and sourced physics, and the atlas only
  claims that for the pitches it has actually worked. This is the field-wide map: a
  sourced one-liner per pitch, the honest status, and a door into the full specimen
  when one exists. The edges are the point — an alias, an illusion, and a
  colloquialism that is not a real pitch are all here, labeled.
*/
export function RepertoirePage() {
  const count = REPERTOIRE.length
  const filed = REPERTOIRE.filter((e) => e.filedSlug).length

  useSeoMeta({
    title: `The Repertoire: every accepted pitch, by family | ${SITE.siteName}`,
    description:
      'A field-wide catalog of every pitch a coach, a pitcher, or the tracking taxonomy would call accepted — fastballs, breaking balls, changeups, specialty, and the banned doctored family. Each one a sourced one-liner, labeled by confidence.',
    ogTitle: `The Repertoire | ${SITE.siteName}`,
    ogDescription: 'Every accepted pitch, by family. Sourced, not corrected.',
    ogUrl: `${SITE.canonicalDomain}/repertoire`,
  })

  return (
    <>
      <section className="on-stage relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.1]" aria-hidden="true">
          <div className="h-full w-full bg-[radial-gradient(circle_at_70%_30%,rgba(108,172,228,0.16),transparent_40%),linear-gradient(115deg,rgba(242,236,221,0.07)_0_1px,transparent_1px_100%)] bg-[size:auto,34px_34px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-bone-2/80">
            <Link to="/" className="transition-colors hover:text-bone">The Atlas</Link>
            <span aria-hidden="true">/</span>
            <span className="text-bone-2">The Repertoire</span>
          </nav>
          <p className="mono-label-stage">The catalog</p>
          <h1 className="display mt-4 max-w-[18ch] text-[2.6rem] leading-[1.0] text-bone md:text-[4.4rem]">
            Every accepted pitch, by family.
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-bone-2">
            Ask three people how many pitches there are and you get three honest answers: about fifteen
            the tracking systems tag, the seven or eight that win most games, and thirty-plus a pitching
            lab will name by grip and intent. This is the third list. Each pitch gets a sourced one-line
            grip and one-line movement, the family it belongs to, and an honest status. Where the atlas
            has filed the full specimen, there is a door into it. The edges stay visible: an alias, an
            illusion, and a name that is not a real pitch are all here, and labeled.
          </p>
          {count > 0 ? (
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-bone-2/70">
              {count} pitches filed · {filed} with a full specimen on file
            </p>
          ) : null}
        </div>
      </section>

      {count === 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
          <p className="text-lg text-ink-2">The catalog is being filed.</p>
        </section>
      ) : (
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          {REPERTOIRE_FAMILIES.map((fam, idx) => {
            const entries = repertoireByFamily(fam.family)
            if (entries.length === 0) return null
            return (
              <section key={fam.family} className={idx > 0 ? 'mt-20' : ''}>
                <TierMarker index={String(idx + 1).padStart(2, '0')} label={fam.label} />
                <p className="mb-8 max-w-[64ch] text-base leading-relaxed text-ink-2">{fam.blurb}</p>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {entries.map((e) => (
                    <RepertoireEntryCard key={e.id} entry={e} />
                  ))}
                </div>
              </section>
            )
          })}

          <p className="mt-20 max-w-[78ch] border-t border-navy/12 pt-6 text-sm leading-relaxed text-ink-2">
            Filed the way everything here is filed: each line carries its confidence label and one click
            to its source. A pitch without a full specimen is not faked into one — it gets an honest
            one-liner and a link out. Sourced, not corrected.
          </p>
        </div>
      )}
    </>
  )
}
