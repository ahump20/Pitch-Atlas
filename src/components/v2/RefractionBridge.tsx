import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import type { PitchAtlasEntry } from '../../data/types'
import { accentForSlug } from '../refractor/accents'
import { SeamSchematic } from '../fallback/SeamSchematic'
import { SpecimenBoundary } from '../ball/SpecimenBoundary'
import { ChapterMark } from './ChapterMark'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import { useInView } from '../../hooks/useInView'

const AlignedSeamScene = lazy(() => import('./AlignedSeamScene'))

export function RefractionBridge({ featured }: { featured: PitchAtlasEntry }) {
  const accent = accentForSlug(featured.display.slug)
  const webgl = useWebGLSupport()
  const { ref, inView } = useInView<HTMLDivElement>('200px')
  const [view, setView] = useState<'model' | 'diagram'>('model')
  const schematic = <SeamSchematic className="archive-seam-drawing" surface="stage"
    spinAxis={featured.motion.spinAxis} gyro={featured.motion.gyro} showAxis={false}
    title="Seam-informed schematic: the same figure-eight seam projected into two dimensions." />

  return (
    <section id="refraction" data-scene-tint={accent.c3}
      className="v2-bridge archive-bridge" data-view={view} data-webgl={webgl ? 'true' : 'false'}
      style={{ '--c3': accent.c3 } as React.CSSProperties}>
      <div className="archive-bridge-inner">
        <div className="archive-bridge-read">
          <ChapterMark n="02" name="Inside the cover" accent={accent.c3} className="archive-chapter-mark" />
          <h2>Follow<br />{' '}<em>the seam.</em></h2>
          <p>One seam, two ways to look. Inspect the leather and stitching, then bring the same seam into a clear drawing.</p>
          <p className="archive-bridge-note">Seam-informed schematic. Use the drawing to orient yourself; open the grip to see where the fingers rest.</p>
          {webgl ? <div className="archive-seam-controls" aria-label="Seam presentation">
            <button type="button" aria-pressed={view === 'model'} onClick={() => setView('model')}>Leather & stitching</button>
            <button type="button" aria-pressed={view === 'diagram'} onClick={() => setView('diagram')}>Seam drawing</button>
          </div> : null}
          <Link className="archive-text-link" to={`/pitch/${featured.display.slug}#grip-lab`}>Find the fingers on the four-seam <span aria-hidden="true">→</span></Link>
        </div>
        <figure className="archive-seam-figure">
          <div className="archive-seam-stage" ref={ref}>
            <div className="archive-seam-registration" aria-hidden="true" />
            <div className="archive-seam-flat">{schematic}</div>
            {webgl && inView ? <div className="archive-seam-model" aria-hidden="true">
              <SpecimenBoundary fallback={schematic}>
                <Suspense fallback={schematic}><AlignedSeamScene /></Suspense>
              </SpecimenBoundary>
            </div> : null}
          </div>
          <figcaption><span>01 / The cover</span><span>02 / The seam</span></figcaption>
          <p className="archive-seam-caption">Seam-informed schematic · Original geometry</p>
        </figure>
      </div>
    </section>
  )
}
