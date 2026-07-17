import { Link } from 'react-router-dom'
import { Button } from '../ds/Button'
import { SITE } from '../../config/site'
import { allSources, latestRetrievedAt } from '../../data/sources'
import { asOfDate } from '../../lib/format'
import { Descent } from '../motion/Descent'

const REGISTRY_COUNT = allSources().length
const REGISTRY_AS_OF = asOfDate(latestRetrievedAt(allSources()))
const SCENE_TINT = '#FFD24D'

export function CloseCta() {
  return (
    <section
      data-scene-tint={SCENE_TINT}
      className="v2-stage v2-tooth relative border-t border-bone/10"
    >
      <Descent />
      <div className="mx-auto max-w-[760px] px-5 pt-24 text-center md:px-8 md:pt-32">
        <div className="v2-close-converge">
          <h2 className="rfx-athletic v2-display text-[clamp(32px,6vw,64px)] leading-[0.98] [text-wrap:balance] md:leading-[0.92]">
            Preserve the pitches baseball almost forgot.
          </h2>
          <p className="mx-auto mt-5 max-w-[48ch] text-[15.5px] leading-relaxed text-bone-2">
            Start at the Pitch Index, open a specimen, and carry a piece of the record forward.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button as={Link} to="/repertoire" variant="chrome" arrow>
              Open the Pitch Index
            </Button>
            <Button as={Link} to="/lost-pitches" variant="ghost" arrow>
              The lost pitches
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[760px] px-5 pb-24 pt-16 text-center md:px-8 md:pb-32">
        <p className="v2-wall-line mx-auto max-w-[62ch]">
          Every grip filed before the arm forgets it. Every claim still wearing its source.
        </p>
        <p className="mx-auto mt-5 max-w-[52ch] text-[13px] leading-relaxed text-bone-2">
          {SITE.sourcePrinciple}. No fabricated spin, velocity, or break; no scraped imagery; no
          copied prose. {REGISTRY_COUNT} sources in the citation registry, last checked{' '}
          {REGISTRY_AS_OF}.{' '}
          <Link
            to="/sources"
            className="whitespace-nowrap text-bone underline underline-offset-2 transition-colors hover:text-bone-2"
          >
            How a claim is filed <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </section>
  )
}
