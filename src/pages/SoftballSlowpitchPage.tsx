import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { canonicalUrl } from '../lib/seo'
import { SLOWPITCH_NOTES, SLOWPITCH_CRAFT, SLOWPITCH_FORMATS } from '../data/softball'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { StageTierMarker } from '../components/layout/StageTierMarker'
import { ClaimProse } from '../components/provenance/ClaimProse'

/*
  Slowpitch, filed honestly and lighter. No windmill, no riseball shape — but a
  real craft of arc, deadening spin, and placement. The one figure people argue
  over, the legal arc, genuinely differs by sanctioning body, so the page names the
  discrepancy instead of pretending to a single number.
*/

export function SoftballSlowpitchPage() {
  useSeoMeta({
    title: `Slowpitch: arc and touch | ${SITE.siteName}`,
    description:
      'Slowpitch softball pitching, filed honestly — the legal arc (and why the number differs by sanctioning body), the real craft of arc, deadening spin, and placement, and how men’s and coed differ. Sourced, not corrected.',
    ogTitle: `Slowpitch | ${SITE.siteName}`,
    ogDescription: 'Arc, spin, and placement. Sourced, not corrected.',
    ogUrl: canonicalUrl('/softball/slowpitch'),
  })

  return (
    <>
      <SectionHero
        accent="seam"
        breadcrumb={
          <Breadcrumb
            trail={[{ label: 'The Atlas', to: '/' }, { label: 'Softball', to: '/softball' }, { label: 'Slowpitch' }]}
          />
        }
        eyebrow="Slowpitch · arc and touch"
        title="Arc, spin, and placement."
        sub={
          <>
            Slowpitch strips the pitch down: no windmill and no riseball shape. What is left is a real, narrow
            craft — arc height, the backspin that deadens a ball on the plate, and placement to the corners of
            the mat. It is the opposite end of the craft from the riseball, filed here for exactly that
            contrast. Early innings — lighter than the fastpitch wing on purpose.
          </>
        }
      />

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <StageTierMarker index="01" label="The rule that shapes it" />
        <div className="flex flex-col gap-9">
          {SLOWPITCH_NOTES.map((n) => (
            <div key={n.label}>
              <div className="mono-label mb-2.5 text-ink-2">{n.label}</div>
              <ClaimProse claim={n.claim} proseClassName="max-w-[64ch] text-lg leading-relaxed text-ink" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <StageTierMarker index="02" label="The craft that is left" />
        <div className="flex max-w-[68ch] flex-col gap-6">
          {SLOWPITCH_CRAFT.map((p, i) => (
            <p key={i} className="text-lg leading-relaxed text-ink">{p}</p>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <StageTierMarker index="03" label="Men’s and coed" />
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
          {SLOWPITCH_FORMATS.map((p, i) => (
            <p key={i} className="text-lg leading-relaxed text-ink">{p}</p>
          ))}
        </div>
        <p className="mt-10 max-w-[78ch] border-t border-ink/15 pt-6 text-sm leading-relaxed text-ink-2">
          Filed lighter than the fastpitch wing on purpose. The honest read: slowpitch pitching is a craft of
          touch and rules, not power — and the rules themselves vary by league, so the arc number is named, not
          smoothed.
        </p>
      </section>
    </>
  )
}
