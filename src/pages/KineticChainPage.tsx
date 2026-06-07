import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { KineticChain } from '../components/sections/KineticChain'

/*
  The kinetic-chain page. The interactive companion to the Kinetic Chain wing:
  step the delivery phase by phase and see where the sourced joint angles and
  velocities live. The diagram leads; the reading and the sources sit with it.
*/
export function KineticChainPage() {
  useSeoMeta({
    title: `The kinetic chain, phase by phase | ${SITE.siteName}`,
    description:
      "Scrub through a pitching delivery — foot contact, maximum external rotation, acceleration, release, deceleration — and watch the peer-reviewed joint angles and velocities appear where they belong. A schematic, every figure sourced to the biomechanics literature.",
    ogTitle: `The kinetic chain, phase by phase | ${SITE.siteName}`,
    ogDescription: 'Step the delivery and see where velocity is made — and where arms break. Sourced, not corrected.',
    ogUrl: `${SITE.canonicalDomain}/kinetic-chain`,
  })

  return (
    <>
      <SectionHero
        breadcrumb={
          <Breadcrumb
            trail={[
              { label: 'The Atlas', to: '/' },
              { label: 'Learn', to: '/learn' },
              { label: 'Kinetic chain' },
            ]}
          />
        }
        eyebrow="How velocity is made"
        title="The chain, one phase at a time."
        sub={
          <>
            Velocity is made in the legs and trunk and passed to the arm, ground to glove, large muscle to
            small. Step through the delivery and watch what each link is doing as it hands off the load — and
            where, if the chain breaks, the elbow and shoulder end up paying for it.
          </>
        }
      />

      <section>
        <div className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-16">
          <KineticChain />
          <p className="mt-10 max-w-[72ch] border-t border-[rgba(255,255,255,0.12)] pt-6 text-sm leading-relaxed text-ink-2">
            The figure is a teaching schematic — a posed stick frame, not a measured motion capture or any
            player's likeness. The numbers are not: each joint angle and velocity is drawn from the
            peer-reviewed biomechanics literature (ASMI / Fleisig, the Clinician's Guide, and supporting
            studies of 1,000+ pitchers). For the full reading, see{' '}
            <a href="/learn/mechanics" className="text-cyan underline-offset-2 hover:underline">
              The Kinetic Chain
            </a>
            . This is educational reference, not medical or training advice — see{' '}
            <a href="/learn/arm-health" className="text-cyan underline-offset-2 hover:underline">
              Arm Health
            </a>
            .
          </p>
        </div>
      </section>
    </>
  )
}
