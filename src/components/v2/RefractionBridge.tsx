import type { PitchAtlasEntry } from '../../data/types'
import { accentForSlug } from '../refractor/accents'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { BallStage } from '../ball/BallStage'
import { ChapterMark } from './ChapterMark'
import { Descent } from '../motion/Descent'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'

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
  // Without WebGL the left figure holds the flat fallback, not a turnable model.
  // Standing the two objects side by side made that visible: a static drawing was
  // wearing the words "3D specimen / drag to turn". The caption follows what is
  // actually in the frame. Only the words change, never the box, so the swap on
  // hydration costs no layout shift.
  const webgl = useWebGLSupport()

  return (
    <section
      id="refraction"
      data-scene-tint={accent.c3}
      className="v2-stage v2-bridge relative border-t border-bone/10"
      style={{ '--c3': accent.c3 } as React.CSSProperties}
    >
      {/* the descent: the hero's "watch it flatten" gesture lands here as the
          thread dropping into its 2D twin — the shared boundary mark, drawn in
          on scroll. Decorative; the section reads complete without it. */}
      <Descent />
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-12 px-5 py-20 md:grid-cols-2 md:gap-16 md:px-8 md:py-28">
        {/* Both media, together. The heading has always said "One seam. Two
            media." — until now only the flat draw was on the page, so the
            sentence was asking the visitor to take the 3D specimen on faith.
            Here it is: real leather, the solved seam, turning, and draggable.

            No grip hand on this beat, on purpose. The subject here is the seam —
            one function drawn two ways — so the specimen is the bare cover. The
            hand and its sourced pressure pins belong on the cards and in the
            Grip Lab, where the grip itself is the subject. */}
        {/* Two objects on one shelf. Before this they were stacked — a big square
            canvas holding a ball that filled less than half of it, then a single
            caption row splitting "3D specimen" hard left and the flat twin hard
            right. The label for the model ended up ~200px from the model and
            level with the diagram instead, so it read as the diagram's caption
            and the section carried a column of dead black no object was using.
            Now each figure sits on the shared bottom edge with its own name
            directly beneath it, and the camera is pulled in until the specimen
            fills its frame. Both captions are two lines so the shelf aligns the
            object bottoms and the caption tops at the same time. */}
        <div className="order-2 md:order-1">
          <div className="v2-bridge-svg flex items-end justify-center gap-[clamp(14px,3.4vw,26px)]">
            <figure className="m-0 w-[clamp(196px,52vw,300px)] flex-none">
              {/* draggable, and the cursor now says so — "Drag to turn" was an
                  instruction with no affordance behind it */}
              <div
                className={`relative aspect-square w-full ${webgl ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                {/* the refraction the section is named for, scoped to the ball it
                    comes off — spread wider than the specimen it read as haze */}
                <div
                  className="v2-bridge-foil pointer-events-none absolute inset-[14%] rounded-full opacity-70 blur-2xl"
                  aria-hidden="true"
                  style={{ background: 'var(--foil)', mixBlendMode: 'screen' }}
                />
                <BallStage
                  entry={featured}
                  surface="stage"
                  distance={5}
                  className="absolute inset-0 h-full w-full"
                />
              </div>
              <figcaption className="mt-3 whitespace-nowrap text-center font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-bone-2">
                {webgl ? '3D specimen' : 'Seam schematic'}
                <span className="block text-bone-2/70">
                  {webgl ? 'Drag to turn' : '3D needs WebGL'}
                </span>
              </figcaption>
            </figure>

            {/* the flat twin, struck small beside the model it comes out of. Its
                second caption line is the seam-informed label the paragraph
                promises stays attached to the diagram wherever it appears. */}
            {/* the floor is the caption, not the diagram: below ~96px "2D
                schematic" broke onto two lines and "seam-informed" onto a
                third, so the twin wore a four-line label on a phone */}
            <figure className="m-0 w-[clamp(96px,20vw,112px)] flex-none">
              <SeamSchematic
                className="aspect-square w-full"
                surface="stage"
                spinAxis={featured.motion.spinAxis}
                gyro={featured.motion.gyro}
                title="The four-seam specimen, flattened: the same figure-eight seam the 3D ball draws, projected to 2D and oriented to the pitch's spin axis."
              />
              <figcaption className="mt-3 whitespace-nowrap text-center font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-bone-2">
                2D schematic
                <span className="block text-bone-2/70">Seam-informed</span>
              </figcaption>
            </figure>
          </div>
        </div>

        {/* the read */}
        <div className="order-1 md:order-2">
          <ChapterMark n="02" name="The Refraction" accent={accent.c3} />
          <h2 className="rfx-athletic v2-display mt-4 text-[clamp(28px,4.6vw,46px)] leading-[0.96]">
            One seam. Two media.
          </h2>
          <p className="mt-5 max-w-[48ch] text-[15px] leading-relaxed text-bone-2">
            This flat diagram and the tilting 3D specimen are two draws of a single function. The 3D
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
