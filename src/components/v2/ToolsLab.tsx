import { WaxPack, WaxPackIdleStyles, type WaxPackTool } from '../sections/WaxPack'
import { ChapterMark } from './ChapterMark'
import { Descent } from '../motion/Descent'

/*
  v2 · The tools, sealed. The craft map made playable — the four interactive
  surfaces as wax packs printed in collegiate-jewel ink, set on the matte stage
  as a deliberate cream-on-black counterpoint (the same register the wall's
  sourced backs use). Names are canonical, matched to the destination pages and
  the masthead so the same tool never wears two names.
*/
const TOOLS: WaxPackTool[] = [
  { label: 'Shape Lab', to: '/sandbox', kind: 'dial', ink: '#1F3A5F', blurb: 'Turn the spin-axis clock and watch the shape language change: ride, drop, run, sweep.' },
  { label: 'The Shape Map', to: '/movement-map', kind: 'quadrant', ink: '#2F5D46', blurb: 'Every filed pitch on one catcher’s-eye field, grouped by direction and character.' },
  { label: 'Compare pitches', to: '/compare', kind: 'tunnel', ink: '#6E2B35', blurb: 'Overlay any two pitches to read the shared window and the late shape split.' },
  { label: 'Compare grips', to: '/grips#grip-compare', kind: 'grips', ink: '#8A6B24', blurb: 'Two grips under one arm slot: same release, different grip, and the hitter never sees it.' },
]

/* the chapter's accent: published to the far stratum and worn by the chapter tick */
const SCENE_TINT = '#00A2A0'

export function ToolsLab() {
  return (
    <section data-scene-tint={SCENE_TINT} className="v2-stage v2-tooth relative border-t border-bone/10">
      <Descent />
      <div className="mx-auto max-w-[1320px] px-5 py-20 md:px-8 md:py-28">
        <ChapterMark n="06" name="The Tools" accent={SCENE_TINT} />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="rfx-athletic v2-display max-w-[14ch] text-[clamp(28px,5vw,52px)] leading-[0.94]">
            The tools.
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-2/75">
            {TOOLS.length} sealed packs
          </span>
        </div>
        <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-bone-2">
          The craft map, made playable. Tear one open. Every pack is one click from here.
        </p>
        <WaxPackIdleStyles />
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-6 md:gap-x-6 lg:grid-cols-4">
          {TOOLS.map((t) => (
            <WaxPack key={t.to} tool={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
