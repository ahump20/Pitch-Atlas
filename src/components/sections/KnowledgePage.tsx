import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { KnowledgeWing } from '../../data/knowledge/types'
import { SectionHero } from '../layout/SectionHero'
import { Breadcrumb } from '../layout/Breadcrumb'
import { StageTierMarker } from '../layout/StageTierMarker'
import { ClaimProse } from '../provenance/ClaimProse'
import { SourcedValue } from '../provenance/SourcedValue'
import { EducationalDisclaimer } from './EducationalDisclaimer'
import { DiscussionPanel } from './DiscussionPanel'

/*
  One template for every knowledge wing. Hero (dark stage) -> educational note when
  the wing carries one -> a numbered section per teaching block: original prose,
  then the sourced claims that back it, each wearing its confidence + source badge,
  then a pulled stat when the section has one. The same provenance primitives the
  specimen pages use, so a teaching page is held to the same honesty contract. The
  related rail and the discussion layer close it, like the pitch chapters.
*/

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function KnowledgePage({ wing }: { wing: KnowledgeWing }) {
  return (
    <>
      <SectionHero
        accent={wing.accent ?? 'powder'}
        breadcrumb={
          <Breadcrumb
            trail={[
              { label: 'The Atlas', to: '/' },
              { label: 'Learn', to: '/learn' },
              { label: wing.navLabel || wing.title },
            ]}
          />
        }
        eyebrow={wing.eyebrow}
        title={wing.title}
        sub={wing.sub}
      />

      {wing.educational ? (
        <section className="mx-auto max-w-6xl px-5 pt-12 md:px-8">
          <EducationalDisclaimer />
        </section>
      ) : null}

      {wing.sections.map((section, i) => {
        return (
          <section key={section.heading}>
            <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
              <StageTierMarker index={pad(i + 1)} label={section.heading} />

              <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
                <div className="md:col-span-7">
                  {section.paragraphs.map((p, j) => (
                    <p
                      key={j}
                      className="mb-5 max-w-[64ch] text-lg leading-relaxed text-ink last:mb-0"
                    >
                      {p}
                    </p>
                  ))}

                  {section.pullStat ? (
                    <div className="rfx-panel mt-8 max-w-[40ch] rounded-sm border-l-2 border-l-seam px-6 py-5">
                      <p className="mono-label mb-2 text-ink-3">{section.pullStat.label}</p>
                      <SourcedValue claim={section.pullStat.claim} valueClassName="text-3xl" accent />
                    </div>
                  ) : null}
                </div>

                {section.claims && section.claims.length > 0 ? (
                  <div className="md:col-span-5">
                    <p className="mono-label mb-5 text-ink-3">The sources behind it</p>
                    <ul className="flex flex-col gap-6">
                      {section.claims.map((claim, k) => (
                        <li key={k} className="border-l border-[rgba(255,255,255,0.12)] pl-4">
                          <ClaimProse
                            claim={claim}
                            proseClassName="text-[0.95rem] leading-relaxed text-ink/90"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        )
      })}

      {/* How this wing was sourced — honest footer, in the page's own voice. */}
      <section className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        <p className="max-w-[72ch] border-t border-[rgba(255,255,255,0.12)] pt-6 text-sm leading-relaxed text-ink-2">
          <span className="mono-label mr-2 text-ink-3">How this was sourced</span>
          {wing.confidenceNote}
        </p>
      </section>

      {wing.related && wing.related.length > 0 ? (
        <section>
          <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
            <p className="mono-label mb-5 text-bone-2">Keep reading</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wing.related.map((r) => (
                <Link
                  key={r.to}
                  to={r.to}
                  className="rfx-plate group flex items-center justify-between gap-3 rounded-sm px-5 py-4"
                  style={{ '--gc': '#37D6FF' } as CSSProperties}
                >
                  <span className="font-athletic text-lg uppercase text-bone">{r.label}</span>
                  <span className="mono-label text-cyan transition-colors group-hover:text-bone">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <DiscussionPanel topicKey={`learn:${wing.slug}`} topicName={wing.navLabel || wing.title} />
    </>
  )
}
