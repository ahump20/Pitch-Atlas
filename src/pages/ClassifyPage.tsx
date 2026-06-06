import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { PitchClassifier } from '../components/sections/PitchClassifier'

/*
  The classify page. Enter a tracking line, get the likely pitch family with honest
  confidence — the pitching-coach classifier, made interactive. The tool leads; the
  honesty caveat and the path to the filed specimen sit with it.
*/
export function ClassifyPage() {
  useSeoMeta({
    title: `What pitch is this? The tracking-line classifier | ${SITE.siteName}`,
    description:
      "Enter a pitch's velocity and movement — and optionally its spin and efficiency — and the atlas scores the shape against every pitch family to name the most likely one, with honest confidence and a runner-up. A reasoned read from movement, not a verified pitch ID.",
    ogTitle: `What pitch is this? | ${SITE.siteName}`,
    ogDescription: 'Turn a tracking line into a labeled pitch. Reasoned from movement, not verified — sourced, not corrected.',
    ogUrl: `${SITE.canonicalDomain}/classify`,
  })

  return (
    <>
      <SectionHero
        breadcrumb={<Breadcrumb trail={[{ label: 'The Atlas', to: '/' }, { label: 'What pitch is this?' }]} />}
        eyebrow="The tracking line"
        accent="powder"
        title="What pitch is this?"
        sub={
          <>
            Pitch families overlap, and the eye is a poor judge. Feed in a tracking line — velocity, ride,
            run, and optionally spin and efficiency — and the atlas places the shape in the family it fits
            closest, names the runner-up when the call is genuinely close, and tells you how sure it is.
          </>
        }
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-16">
          <PitchClassifier />
          <p className="mt-10 max-w-[72ch] border-t border-navy/12 pt-6 text-sm leading-relaxed text-ink-2">
            How it works: the tool scores your line against the typical velocity and movement of each pitch
            family and returns the nearest match. Movement places the family reliably, but it is a reasoned
            read, not a verified pitch ID — grip and high-speed video are what confirm the exact pitch. The
            classifier logic is shared with the pitching-coach field tool; the families it knows map to the{' '}
            <a href="/repertoire" className="text-columbia underline-offset-2 hover:underline">
              full Pitch Index
            </a>
            .
          </p>
        </div>
      </section>
    </>
  )
}
