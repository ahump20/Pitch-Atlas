import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSeoMeta } from '@unhead/react'
import { SITE } from '../config/site'
import { canonicalUrl, contentJsonLd, ogImageMeta } from '../lib/seo'
import { StructuredData } from '../components/seo/StructuredData'
import { SectionHero } from '../components/layout/SectionHero'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { StageTierMarker } from '../components/layout/StageTierMarker'
import { Button, SegmentedToggle } from '../components/ds'
import { ClaimProse } from '../components/provenance/ClaimProse'
import { ConfidenceLabel } from '../components/provenance/ConfidenceLabel'
import { SourceBadge } from '../components/provenance/SourceBadge'
import { useWebGLSupport } from '../hooks/useWebGLSupport'
import { EXAMPLE_LOBS, FLIGHT_LAB_NOTES, FLIGHT_LAB_RULEBOOKS, MEASURED_BATTER } from '../data/softball'
import type { Claim } from '../data/types'
import { BAT_DIAMETER_IN, type BoxPosition, type LobParams, type RuleKey } from '../lib/slowpitch'
import { FlightLabStage } from '../components/flightlab/FlightLabStage'
import { ArcGauge, FieldRow, ModelMark, Readout, SliderRow } from '../components/flightlab/controls'
import { DEFAULT_SETTINGS, useLabSettings } from '../components/flightlab/labSettings'
import {
  CAMERA_VIEWS,
  COMPARE_OPTIONS,
  HEIGHT_RANGE,
  TOES_RANGE,
  buildLabModel,
  defaultLobParams,
  fixed,
  heightLabel,
  isRuleKey,
  lookForRange,
  round,
  sideLabel,
  signed,
  type CameraView,
  type LobKey,
  type ThrowRequest,
} from '../components/flightlab/model'

/*
  The slow-pitch Flight Lab. A batter sets their height and stance, picks a
  lob, and reads the verdict their barrel would give it, the landing window to
  look for, and where the barrel meets the ball. One model (src/lib/slowpitch,
  through the lab model) feeds the 3D scene, the flat schematic and every word
  here. The default batter is one batter's measured swing and is never named.
  No spin, speed or break figure is ever shown.
*/

const PAGE_TITLE = 'Flight lab: your slow-pitch strike zone'
const PAGE_DESCRIPTION =
  'Set your height and stance and see the slow-pitch strike zone at your size, under USSSA, USA Softball or Senior rules: where a lob crosses the plate, where your barrel meets it, and which landing spots are your pitch.'

const RULE_OPTIONS = FLIGHT_LAB_RULEBOOKS.map((r) => ({ value: r.key, label: r.name }))
const BOX_OPTIONS: { value: BoxPosition; label: string }[] = [
  { value: 'front', label: 'Front' },
  { value: 'middle', label: 'Middle' },
  { value: 'back', label: 'Back' },
]
const COMPARE_TOGGLE = COMPARE_OPTIONS.map((n) => ({ value: String(n), label: n === 0 ? 'Off' : String(n) }))

const TONE_CLASS = {
  good: 'text-[#FFC23C]',
  warn: 'text-[#FF8A3D]',
  dim: 'text-bone-2',
  bad: 'text-[#FF5A6B]',
} as const

// side by side only from 1280 px: at 1024 the stage column is too narrow for the overlaid look-for panel
const WIDE_QUERY = '(min-width: 1280px)'
function subscribeWide(cb: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mq = window.matchMedia(WIDE_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
function useWide(): boolean {
  return useSyncExternalStore(
    subscribeWide,
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(WIDE_QUERY).matches : false),
    () => false,
  )
}

function RailSection({
  id,
  title,
  action,
  mark,
  children,
}: {
  id: string
  title: string
  action?: ReactNode
  mark?: 'Model' | 'Example'
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id} className="border-t border-bone/12 pt-6 first:border-t-0 first:pt-0">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 id={id} className="rfx-skick">
            {title}
          </h2>
          {mark ? <ModelMark kind={mark} /> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function LinkButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-[32px] font-mono text-xs uppercase tracking-[0.08em] text-cyan underline decoration-cyan/40 underline-offset-4 hover:text-bone disabled:cursor-default disabled:text-bone-3 disabled:no-underline any-pointer-coarse:min-h-[44px]"
    >
      {children}
    </button>
  )
}

function SourceRow({ label, claim, mark }: { label: string; claim: Claim<unknown>; mark?: 'Model' | 'Example' }) {
  return (
    <li className="grid grid-cols-1 gap-2 border-t border-bone/12 py-4 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[0.95rem] leading-snug text-bone">{label}</span>
        {mark ? <ModelMark kind={mark} /> : null}
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        {typeof claim.value === 'string' ? <p className="max-w-[64ch] text-[0.95rem] leading-relaxed text-bone-2">{claim.value}</p> : null}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <ConfidenceLabel confidence={claim.confidence} className="text-xs" />
          {claim.source ? (
            <>
              <span aria-hidden="true" className="text-bone-3">
                /
              </span>
              <SourceBadge source={claim.source} className="text-xs" />
            </>
          ) : null}
        </div>
        {claim.note ? <p className="max-w-[64ch] text-[0.8125rem] leading-snug text-bone-2/85">{claim.note}</p> : null}
      </div>
    </li>
  )
}

function lobLine(p: LobParams): string {
  return `Peaks at ${fixed(p.apex)} ft, lands ${round(p.land)} in past the front of the plate, ${sideLabel(p.side)}.`
}

export function SoftballFlightLabPage() {
  useSeoMeta({
    title: `${PAGE_TITLE} | ${SITE.siteName}`,
    description: PAGE_DESCRIPTION,
    ogTitle: `Flight lab | ${SITE.siteName}`,
    ogDescription: 'Your slow-pitch strike zone at your height, and the lobs that are your pitch.',
    ogUrl: canonicalUrl('/softball/flight-lab'),
    ...ogImageMeta('softball', 'Flight lab: your slow-pitch strike zone'),
  })

  const webgl = useWebGLSupport()
  const wide = useWide()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawRule = searchParams.get('rule')
  const rule: RuleKey = isRuleKey(rawRule) ? rawRule : 'usssa'

  const [settings, updateSettings, resetSettings] = useLabSettings()
  const [params, setParams] = useState<Record<LobKey, LobParams>>(defaultLobParams)
  const [selectedKey, setSelectedKey] = useState<LobKey>('belt')
  const [view, setView] = useState<CameraView>('zone')
  const [slow, setSlow] = useState(false)
  const [playing, setPlaying] = useState(false)
  // the camera buttons only move the 3D scene; if it fails, the schematic has no cameras
  const [sceneLost, setSceneLost] = useState(false)
  const markSceneLost = useCallback(() => setSceneLost(true), [])
  const [throwRequest, setThrowRequest] = useState<ThrowRequest | undefined>(undefined)
  const throwCount = useRef(0)

  const stance = useMemo(
    () => ({ heightIn: settings.heightIn, toesIn: settings.toesIn, box: settings.box, batIn: MEASURED_BATTER.bat.value.lengthIn }),
    [settings.heightIn, settings.toesIn, settings.box],
  )
  const model = useMemo(
    () => buildLabModel({ rule, stance, compareIn: settings.compareIn, params, selected: selectedKey }),
    [rule, stance, settings.compareIn, params, selectedKey],
  )

  const sel = model.selected
  const reading = sel.reading
  const verdict = reading.verdict
  const range = lookForRange(model)
  const hot = reading.lookFor.hot
  const barrel = reading.barrel
  const crossing = sel.flight.land.z > 0
  const defaults = EXAMPLE_LOBS.find((l) => l.key === selectedKey)?.params.value
  const tuned = defaults ? JSON.stringify(defaults) !== JSON.stringify(params[selectedKey]) : false
  const measured = MEASURED_BATTER.stance.value
  const isMeasured =
    settings.heightIn === measured.heightIn &&
    settings.toesIn === measured.toesIn &&
    settings.box === measured.box &&
    settings.compareIn === DEFAULT_SETTINGS.compareIn

  // one quiet announcement once the sliders settle, not one per tick
  const statusText = `${sel.name}: ${verdict.word}. ${range ? `Look for ${range.replace('–', ' to ')} inches past the front of the plate.` : 'No landing spot reaches your barrel.'}`
  const [announced, setAnnounced] = useState(statusText)
  useEffect(() => {
    const id = window.setTimeout(() => setAnnounced(statusText), 600)
    return () => window.clearTimeout(id)
  }, [statusText])

  const throwLobs = useCallback((indices: number[]) => {
    throwCount.current += 1
    setThrowRequest({ id: throwCount.current, indices })
  }, [])

  const pick = (key: LobKey) => {
    setSelectedKey(key)
    setThrowRequest(undefined)
  }
  const tune = (field: 'apex' | 'land' | 'side', value: number) => {
    setParams((prev) => ({ ...prev, [selectedKey]: { ...prev[selectedKey], [field]: value } }))
    setThrowRequest(undefined)
  }
  const setRule = (next: string) => {
    if (!isRuleKey(next)) return
    setSearchParams(
      (current) => {
        const p = new URLSearchParams(current)
        if (next === 'usssa') p.delete('rule')
        else p.set('rule', next)
        return p
      },
      { replace: true, preventScrollReset: true },
    )
  }

  const whySentence = 'Your eyes judge a lob over the plate. Your barrel meets it out front, where it hasn’t finished falling.'
  const insetTop = wide ? 108 : 92
  const insetBottom = wide ? 250 : 0

  return (
    <>
      <StructuredData
        graph={contentJsonLd({
          type: 'CreativeWork',
          url: canonicalUrl('/softball/flight-lab'),
          name: PAGE_TITLE,
          description: PAGE_DESCRIPTION,
          breadcrumb: [
            { name: 'The Atlas', to: '/' },
            { name: 'Softball', to: '/softball' },
            { name: 'Slowpitch', to: '/softball/slowpitch' },
            { name: 'Flight lab' },
          ],
        })}
      />
      <SectionHero
        accent="seam"
        dense
        breadcrumb={
          <Breadcrumb
            trail={[
              { label: 'The Atlas', to: '/' },
              { label: 'Softball', to: '/softball' },
              { label: 'Slowpitch', to: '/softball/slowpitch' },
              { label: 'Flight lab' },
            ]}
          />
        }
        eyebrow="Slowpitch · flight lab"
        title="Your zone, at your height."
        sub={
          <>
            Set your height and where you stand. Every lob drops through your zone, and the lab shows where your
            barrel meets it and which landing spots are your pitch. The swing is one batter’s, measured off their
            own video and scaled to your height. It doesn’t know yours.
          </>
        }
      />

      <section className="on-stage scene-coal border-b border-bone/12" aria-label="The flight lab">
        <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="mono-label-stage text-xs">Rulebook</span>
            <SegmentedToggle options={RULE_OPTIONS} value={rule} onChange={setRule} className="border-bone/25" aria-label="Rulebook" />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-10">
            {/* the stage */}
            <div className="relative min-w-0 self-start xl:sticky xl:top-20">
              <div
                className="relative h-[min(68svh,600px)] min-h-[420px] overflow-hidden rounded-xl border border-bone/12 bg-[#070509] xl:h-[calc(100svh-8rem)] xl:max-h-[860px] xl:min-h-[560px]"
                data-flight-stage="true"
              >
                <FlightLabStage
                  model={model}
                  view={view}
                  slow={slow}
                  throwRequest={throwRequest}
                  onPlaying={setPlaying}
                  onSceneLost={markSceneLost}
                  insetTop={insetTop}
                  insetBottom={insetBottom}
                  className="absolute inset-0"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#070509]/85 to-transparent"
                />
                <div className="pointer-events-none absolute left-4 top-4 right-4 md:left-6 md:top-5">
                  <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-bone-2">
                    <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: sel.color }} />
                    {sel.name}
                  </p>
                  <h2
                    className={`display mt-1 text-[2.25rem] leading-[1.02] md:text-[3.25rem] ${TONE_CLASS[verdict.tone]}`}
                    data-flight-verdict="true"
                  >
                    {verdict.word}
                  </h2>
                  <p className="sr-only" role="status">
                    {announced}
                  </p>
                </div>
              </div>

              {/* look for + the dock: under the stage on phones, over its foot on desktop */}
              <div className="mt-5 flex flex-col gap-5 xl:pointer-events-none xl:absolute xl:inset-x-px xl:bottom-px xl:z-30 xl:mt-0 xl:flex-row xl:items-end xl:justify-between xl:rounded-b-xl xl:bg-gradient-to-t xl:from-[#070509]/92 xl:via-[#070509]/70 xl:to-transparent xl:p-6 xl:pt-16">
                <div className="min-w-0 xl:max-w-[46%]">
                  <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[#FFC23C]">
                    Look for <ModelMark kind="Model" />
                  </p>
                  <p className="mt-1 font-athletic text-[3.25rem] leading-none tabular-nums text-bone md:text-[4rem]" data-flight-lookfor="true">
                    {range ?? 'Nothing'}
                    {range ? <span className="ml-2 align-baseline font-mono text-xl text-bone-2">in</span> : null}
                  </p>
                  <p className="mt-2 font-mono text-xs uppercase tracking-[0.12em] text-bone-2">
                    {range ? 'past the front of the plate' : 'at this arc reaches your barrel'}
                  </p>
                  <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-bone-2">
                    {range
                      ? `Look for it to land ${range.replace('–', ' to ')} in past the front of the plate. ${whySentence}`
                      : `No landing spot puts this arc on your barrel. ${whySentence}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 xl:pointer-events-auto xl:justify-end">
                  <Button arrow disabled={playing} onClick={() => throwLobs([model.selectedIndex])} data-flight-throw="true">
                    Throw
                  </Button>
                  <div className="inline-flex overflow-hidden rounded-lg border border-bone/25">
                    <button type="button" className="rfx-seg" aria-pressed={slow} onClick={() => setSlow((s) => !s)}>
                      Slow
                    </button>
                  </div>
                  {webgl && !sceneLost ? (
                    <SegmentedToggle
                      options={CAMERA_VIEWS}
                      value={view}
                      onChange={(v) => setView(v as CameraView)}
                      className="border-bone/25"
                      aria-label="Camera"
                    />
                  ) : null}
                </div>
              </div>
            </div>

            {/* the rail */}
            <aside aria-label="Lab controls" className="flex min-w-0 flex-col gap-8">
              <RailSection
                id="fl-you"
                title="You"
                action={
                  <LinkButton onClick={resetSettings} disabled={isMeasured}>
                    Reset
                  </LinkButton>
                }
              >
                <p className="-mt-2 mb-5 text-sm leading-relaxed text-bone-2">
                  {isMeasured
                    ? 'Starting on one batter’s measured swing. Set your own height and stance.'
                    : 'Your settings stay in this browser. Reset goes back to the measured batter.'}
                </p>
                <div className="flex flex-col gap-6">
                  <SliderRow
                    label="Height"
                    value={settings.heightIn}
                    display={heightLabel(settings.heightIn)}
                    min={HEIGHT_RANGE.min}
                    max={HEIGHT_RANGE.max}
                    step={1}
                    onChange={(heightIn) => updateSettings({ heightIn })}
                  />
                  <SliderRow
                    label="Toes to plate"
                    value={settings.toesIn}
                    display={`${settings.toesIn} in`}
                    min={TOES_RANGE.min}
                    max={TOES_RANGE.max}
                    step={1}
                    onChange={(toesIn) => updateSettings({ toesIn })}
                  />
                  <FieldRow label="Box">
                    <SegmentedToggle
                      options={BOX_OPTIONS}
                      value={settings.box}
                      onChange={(box) => updateSettings({ box: box as BoxPosition })}
                      className="border-bone/25"
                      aria-label="Where you stand in the box"
                    />
                  </FieldRow>
                  <FieldRow label="Bat">
                    <span className="font-mono text-base text-bone">
                      {stance.batIn} × {BAT_DIAMETER_IN === 2.25 ? '2¼' : BAT_DIAMETER_IN} in
                    </span>
                  </FieldRow>
                  <FieldRow label="Compare">
                    <SegmentedToggle
                      options={COMPARE_TOGGLE}
                      value={String(settings.compareIn)}
                      onChange={(v) => updateSettings({ compareIn: Number(v) })}
                      className="border-bone/25"
                      aria-label="Compare with your old bat, inches"
                    />
                  </FieldRow>
                  {model.comparison ? (
                    <div className="grid grid-cols-2 gap-4">
                      <Readout label="Barrel reach" value={signed(model.comparison.reachGapIn)} unit={`in vs ${model.compareIn}`} />
                      <Readout
                        label={`To match your ${model.compareIn}`}
                        value={signed(model.comparison.matchShiftIn)}
                        unit="in away"
                      />
                    </div>
                  ) : null}
                </div>
              </RailSection>

              <RailSection id="fl-pitches" title="Pitches">
                <ul className="flex flex-col gap-1.5">
                  {model.lobs.map((lob, i) => {
                    const on = i === model.selectedIndex
                    const v = lob.reading.verdict
                    return (
                      <li key={lob.key}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => pick(lob.key)}
                          className={`flex min-h-[52px] w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan ${
                            on ? 'border-cyan/60 bg-cyan/[0.07]' : 'border-transparent hover:border-bone/20'
                          }`}
                        >
                          <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: lob.color }} />
                          <span className="min-w-0 flex-1">
                            <span className="display block text-lg leading-tight text-bone">{lob.name}</span>
                            <span className="block font-mono text-xs text-bone-2">
                              {fixed(lob.params.apex)} ft · lands {round(lob.params.land)} in
                            </span>
                          </span>
                          <span className={`shrink-0 font-mono text-xs uppercase tracking-[0.08em] ${TONE_CLASS[v.tone]}`}>{v.short}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <Button
                  variant="ghost"
                  className="mt-4 w-full justify-center"
                  disabled={playing}
                  onClick={() => throwLobs(model.lobs.map((_, i) => i))}
                >
                  Throw all six
                </Button>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-xs leading-snug text-bone-2">
                  <ModelMark kind="Example" /> Example arcs, set by hand to teach, not measured from a pitcher.
                </p>
              </RailSection>

              <RailSection
                id="fl-tune"
                title={`Tune the ${sel.name.toLowerCase()}`}
                action={
                  <LinkButton
                    onClick={() => {
                      if (defaults) setParams((prev) => ({ ...prev, [selectedKey]: { ...defaults } }))
                      setThrowRequest(undefined)
                    }}
                    disabled={!tuned}
                  >
                    Reset
                  </LinkButton>
                }
              >
                <div className="flex flex-col gap-6">
                  <SliderRow
                    label="Arc peak"
                    value={params[selectedKey].apex}
                    display={`${fixed(params[selectedKey].apex)} ft`}
                    // the solver lifts any peak under release + 0.4 m, so the slider starts there
                    min={4.2}
                    max={13}
                    step={0.1}
                    onChange={(v) => tune('apex', v)}
                  />
                  <SliderRow
                    label="Lands past front edge"
                    value={params[selectedKey].land}
                    display={`${params[selectedKey].land} in`}
                    min={-30}
                    max={150}
                    step={1}
                    onChange={(v) => tune('land', v)}
                  />
                  <SliderRow
                    label="Across the plate"
                    value={params[selectedKey].side}
                    display={sideLabel(params[selectedKey].side)}
                    min={-24}
                    max={24}
                    step={1}
                    onChange={(v) => tune('side', v)}
                  />
                </div>
              </RailSection>

              <RailSection id="fl-this" title="This pitch" mark="Model">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                  {[
                    { k: 'Arc peak', v: fixed(reading.apexFt), u: 'ft', show: true },
                    { k: 'Over the plate', v: round(reading.overPlateIn), u: 'in high', show: crossing },
                    { k: 'Over the plate', v: 'Short', u: 'lands in front', show: !crossing },
                    { k: 'At your barrel', v: barrel ? round(barrel.heightIn) : '', u: barrel ? `in, ${round(barrel.outFrontIn)} in out` : '', show: Boolean(barrel) },
                    { k: 'Falling at', v: `${fixed(reading.fallingAngleDeg, 0)}°`, u: '', show: crossing },
                    {
                      k: 'Strike window',
                      v:
                        rule === 'senior'
                          ? `0–${round(reading.strikeWindowIn[1])}`
                          : `${round(reading.strikeWindowIn[0])}–${round(reading.strikeWindowIn[1])}`,
                      u: 'in',
                      show: true,
                    },
                  ].filter((s) => s.show).map((s) => (
                    <div key={s.k} className="min-w-0 border-t border-bone/12 pt-2">
                      <dt className="mono-label-stage text-xs leading-snug">{s.k}</dt>
                      <dd className="mt-1.5 font-mono text-xl tabular-nums text-bone">
                        {s.v}
                        {s.u ? <span className="ml-1.5 text-xs text-bone-2">{s.u}</span> : null}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-xs leading-snug text-bone-2">
                  Strike window and look-for are landing spots, in inches past the front of the plate.
                  {hot ? '' : ' At this arc no landing spot reaches your barrel.'}
                </p>
                {sel.flight.converged ? null : (
                  <p className="mt-2 text-xs leading-snug text-[#FF5A6B]" data-flight-unsolved="true">
                    No throw in this model peaks and lands exactly there. The path shown is the closest it gets.
                  </p>
                )}
              </RailSection>

              <RailSection id="fl-rules" title={`${model.rulebook.name} rules`}>
                <div className="flex flex-col gap-5">
                  {[
                    { k: 'Zone', c: model.rulebook.zoneText },
                    { k: 'Arc', c: model.rulebook.arcText },
                    { k: 'Illegal', c: model.rulebook.illegalText },
                  ].map((r) => (
                    <div key={r.k}>
                      <p className="mono-label-stage mb-2 text-xs">{r.k}</p>
                      <ClaimProse claim={r.c} proseClassName="text-[0.95rem] leading-relaxed text-bone" />
                    </div>
                  ))}
                  <div>
                    <p className="mono-label-stage mb-2 text-xs">Legal arc, ft, with each lob’s peak</p>
                    <ArcGauge rule={rule} model={model} />
                  </div>
                </div>
              </RailSection>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20" aria-labelledby="fl-sources">
        <StageTierMarker index="01" label="Every figure, and where it comes from" id="fl-sources" />
        <p className="mb-8 max-w-[68ch] text-base leading-relaxed text-ink-2">
          Rule lines come from the rule books, each cited to its rule or definition. The batter, the swing model
          and the example lobs are the lab’s own inputs, tagged that way, so a modelled number never passes for
          a measured one.
        </p>

        <h3 className="mono-label mb-2 text-xs">Rulebooks</h3>
        <ul className="mb-10">
          {FLIGHT_LAB_RULEBOOKS.flatMap((r) => [
            <SourceRow key={`${r.key}-arc`} label={`${r.name}: arc`} claim={r.arcText} />,
            <SourceRow key={`${r.key}-zone`} label={`${r.name}: strike zone`} claim={r.zoneText} />,
            <SourceRow key={`${r.key}-illegal`} label={`${r.name}: illegal pitch`} claim={r.illegalText} />,
          ])}
        </ul>

        <h3 className="mono-label mb-2 text-xs">Bat, sweet spot and air</h3>
        <ul className="mb-10">
          {FLIGHT_LAB_NOTES.map((n) => (
            <SourceRow
              key={n.label}
              label={n.label}
              claim={n.claim}
              mark={/lift and drag|sweet spot/i.test(n.label) ? 'Model' : undefined}
            />
          ))}
        </ul>

        <h3 className="mono-label mb-2 text-xs">The batter</h3>
        <ul className="mb-10">
          <SourceRow
            label="Height, stance and box: one batter’s measured swing"
            claim={{
              ...MEASURED_BATTER.stance,
              value: `${heightLabel(measured.heightIn)}, toes ${measured.toesIn} in off the plate, ${measured.box} of the box.`,
            }}
            mark="Model"
          />
          <SourceRow
            label="Stride, reach and landmarks: the swing model"
            claim={{
              ...MEASURED_BATTER.swing,
              value: 'Knee, belt, chest and shoulder heights, the stride and the hands’ reach, as fractions of height.',
            }}
            mark="Model"
          />
          <SourceRow
            label="Bat"
            claim={{
              ...MEASURED_BATTER.bat,
              value: `${MEASURED_BATTER.bat.value.lengthIn} in long, 2¼ in across.`,
            }}
          />
          <SourceRow
            label="Barrel angle at contact"
            claim={{ ...MEASURED_BATTER.barrelAngleDeg, value: `${MEASURED_BATTER.barrelAngleDeg.value}° below level.` }}
            mark="Model"
          />
        </ul>

        <h3 className="mono-label mb-2 text-xs">The example lobs</h3>
        <ul>
          {EXAMPLE_LOBS.map((l) => (
            <SourceRow key={l.key} label={l.name} claim={{ ...l.params, value: lobLine(l.params.value) }} mark="Example" />
          ))}
        </ul>
      </section>
    </>
  )
}
