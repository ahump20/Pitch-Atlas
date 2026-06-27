import { Link } from 'react-router-dom'
import { REPERTOIRE_FAMILIES, repertoireByFamily } from '../../data/repertoire'
import { FAMILY_ACCENT } from '../sections/family-accent'
import { STATUS_LABEL, isEdgeStatus } from '../index/statusBadgeMeta'
import type { RepertoireEntry, RepertoireStatus } from '../../data/types'

/*
  The repertoire family map. The whole accepted catalog on one screen, grouped by
  family and read by status, so the shape of the ecosystem is legible at a glance:
  which families are deep, which pitches the atlas has filed as full specimens, and
  which names are edges - an alias, an illusion, or a colloquialism that is not a
  distinct pitch at all. A complement to the searchable index, not a copy of it.
  Built straight from REPERTOIRE; deterministic; every node links to its specimen
  or its basic file, so it reads with a keyboard, not just a mouse. No fabricated
  lineage edges - the relationships live as sourced prose on each file, so they are
  not drawn as lines here.
*/

// Read order within a family: the workhorses first, the honest edges last.
const RANK: Record<RepertoireStatus, number> = {
  standard: 0,
  niche: 1,
  rare: 2,
  'near-extinct': 3,
  alias: 4,
  illusion: 5,
  'not-a-pitch': 6,
  banned: 7,
}

function Node({ entry, accent }: { entry: RepertoireEntry; accent: string }) {
  const filed = Boolean(entry.filedSlug)
  const edge = isEdgeStatus(entry.status)
  const to = entry.filedSlug ? `/pitch/${entry.filedSlug}` : `/repertoire/${entry.id}`

  return (
    <Link
      to={to}
      title={`${entry.name} — ${STATUS_LABEL[entry.status]}${entry.filedSlug ? ' (filed specimen)' : ''}`}
      aria-label={`${entry.name}, ${STATUS_LABEL[entry.status]}${entry.filedSlug ? ', filed specimen' : ', basic file'}`}
      className={`group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/70 ${
        edge
          ? 'border-dashed border-bone/20 text-bone-2/60 hover:text-bone-2'
          : filed
            ? 'border-bone/30 text-bone hover:border-bone/60'
            : 'border-bone/15 text-bone-2 hover:text-bone'
      }`}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        aria-hidden="true"
        style={{
          background: filed ? accent : 'transparent',
          boxShadow: filed ? 'none' : `inset 0 0 0 1px ${accent}`,
          opacity: edge ? 0.5 : 1,
        }}
      />
      {entry.name}
    </Link>
  )
}

export function LineageMap() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20" aria-labelledby="lineage-map-title">
      <p className="mono-label text-cyan">The whole repertoire</p>
      <h2 id="lineage-map-title" className="rfx-stitle mt-3 max-w-[22ch] text-[clamp(24px,3.6vw,40px)] leading-[1.04]">
        Every pitch, by family.
      </h2>
      <p className="mt-4 max-w-[66ch] text-base leading-relaxed text-bone-2">
        The accepted catalog at a glance, grouped by family and read by how common the pitch is. A
        solid dot is a filed specimen; a hollow dot is a basic file; a dashed node is an edge case - an
        alias, an illusion, or a name that is not really a distinct pitch.
      </p>

      {/* legend */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.1em] text-bone-2/60">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-bone" aria-hidden="true" /> Filed specimen
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full ring-1 ring-inset ring-bone-2" aria-hidden="true" /> Basic file
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-dashed border-bone/40" aria-hidden="true" /> Edge case
        </span>
      </div>

      <div className="mt-9 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
        {REPERTOIRE_FAMILIES.map((fam) => {
          const entries = repertoireByFamily(fam.family)
            .slice()
            .sort((a, b) => RANK[a.status] - RANK[b.status])
          if (entries.length === 0) return null
          const accent = FAMILY_ACCENT[fam.family]
          return (
            <div key={fam.family}>
              <div className="flex items-baseline gap-2.5 border-b border-bone/12 pb-2">
                <span className="h-3 w-1 rounded-full" style={{ background: accent }} aria-hidden="true" />
                <h3 className="rfx-athletic text-lg uppercase text-bone">{fam.label}</h3>
                <span className="mono-label-stage text-bone-2/50">{entries.length}</span>
              </div>
              <p className="mt-2.5 max-w-[52ch] text-[13.5px] leading-relaxed text-bone-2/80">{fam.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {entries.map((entry) => (
                  <Node key={entry.id} entry={entry} accent={accent} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
