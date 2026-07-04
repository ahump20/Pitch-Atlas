import type { PitchAtlasEntry } from '../../data/types'
import { accentForSlug } from '../refractor/accents'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { ChapterMark } from './ChapterMark'
import { Descent } from '../motion/Descent'

/*
  v2 · The Refraction. The honest bridge from the cinematic ball to the filed
  set: the same seamPoint function the 3D ball draws, flattened into its 2D
  schematic. As the band scrolls in, the schematic scales up (.v2-bridge-svg)
  and a foil ring blooms behind it (.v2-bridge-foil) — the refraction read,
  then the truth underneath it: one function feeds the ball, the diagram, and
  the no-WebGL fallback, so they can never disagree. Static and fully legible
  where view-timeline is unsupported or motion is reduced.
*/
export function RefractionBridge({ featured }: { featured: PitchAtlasEntry }) {
  const accent = accentForSlug(featured.display.slug)

  return (
    <section
      id="refraction"
      data-scene-tint={accent.c3}
      className="v2-stage v2-bridge relative overflow-hidden border-t border-bone/10"
      style={{ '--c3': accent.c3 } as React.CSSProperties}
    >
      {/* the descent: the hero's "watch it flatten" gesture lands here as the
          thread dropping into its 2D twin — the shared boundary mark, drawn in
          on scroll. Decorative; the section reads complete without it. */}
      <Descent />
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-12 px-5 py-20 md:grid-cols-2 md:gap-16 md:px-8 md:py-28">
        {/* the schematic, blooming its foil as it enters */}
        <div className="order-2 flex justify-center md:order-1">
          <div className="v2-bridge-svg relative aspect-square w-full max-w-[380px]">
            <div
              className="v2-bridge-foil pointer-events-none absolute inset-0 rounded-full blur-2xl"
              aria-hidden="true"
              style={{ background: 'var(--foil)', mixBlendMode: 'screen' }}
            />
            <SeamSchematic
              className="relative h-full w-full"
              surface="stage"
              spinAxis={featured.motion.spinAxis}
              gyro={featured.motion.gyro}
              title="The four-seam specimen, flattened: the same figure-eight seam the 3D ball draws, projected to 2D and oriented to the pitch's spin axis."
            />
          </div>
        </div>

        {/* the read */}
        <div className="order-1 md:order-2">
          <ChapterMark n="02" name="The Refraction" accent={accent.c3} />
          <h2 className="rfx-athletic v2-display mt-4 text-[clamp(28px,4.6vw,46px)] leading-[0.96]">
            One seam. Two media.
          </h2>
          <p className="mt-5 max-w-[48ch] text-[15px] leading-relaxed text-bone-2">
            The ball you just tilted and this flat diagram are drawn by a single function. The 3D
            specimen, the 2D schematic, and the no-WebGL fallback all read the same seam geometry, so
            the model and the diagram can never quietly disagree.
          </p>
          <p className="mt-4 max-w-[48ch] text-[13.5px] leading-relaxed text-bone-2/80">
            It is a seam-informed schematic, not a measured cover. That label stays attached to the
            diagram wherever it appears.
          </p>
        </div>
      </div>
    </section>
  )
}
