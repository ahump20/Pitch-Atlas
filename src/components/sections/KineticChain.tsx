import { useState } from 'react'

/*
  The kinetic-chain scrubber. Step through the delivery phase by phase and watch
  the sourced joint-angle and velocity figures appear where they belong. The figure
  is an explicit schematic — a posed stick frame, not a measured body-cam or a
  player likeness — so it teaches the sequence without asserting a precision it
  cannot prove. Every number is the same peer-reviewed value the Kinetic Chain wing
  cites (ASMI / Fleisig, the Clinician's Guide to Baseball Pitching Biomechanics,
  PMC9950989, plus the supporting studies). Energy flows ground to glove,
  proximal to distal; the figures mark what each link is doing as it passes the load on.
*/

interface Joint {
  x: number
  y: number
}
interface Pose {
  pelvis: Joint
  shoulder: Joint
  head: Joint
  elbow: Joint
  hand: Joint
  leadKnee: Joint
  leadFoot: Joint
  backFoot: Joint
  /** draw the ball at the hand unless released */
  ball: boolean
}

interface Readout {
  label: string
  value: string
  source: { label: string; url: string }
}

interface Phase {
  key: string
  name: string
  whats: string
  pose: Pose
  readouts: Readout[]
  load?: string
}

const CLINICIAN = {
  label: "The Clinician's Guide to Baseball Pitching Biomechanics",
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9950989/',
}
const KINETIC_PMC = {
  label: 'The Kinetic Chain in Overhand Pitching (PMC3445080)',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3445080/',
}
const SEPARATION = {
  label: 'Pitching Biomechanics: Hip-Shoulder Separation (Rockland Peak Performance)',
  url: 'https://rocklandpeakperformance.com/pitching-biomechanics-hip-shoulder-separation/',
}

const PHASES: Phase[] = [
  {
    key: 'foot-contact',
    name: 'Foot contact',
    whats:
      'The lead foot lands and the chain locks to the ground. The hips have started to open while the shoulders stay closed, winding the spring between them. Most of the velocity to come is being loaded right now, in the legs and trunk — not the arm.',
    pose: {
      pelvis: { x: 150, y: 150 }, shoulder: { x: 150, y: 106 }, head: { x: 150, y: 84 },
      elbow: { x: 150, y: 80 }, hand: { x: 131, y: 67 },
      leadKnee: { x: 210, y: 164 }, leadFoot: { x: 240, y: 214 }, backFoot: { x: 96, y: 214 },
      ball: true,
    },
    readouts: [
      { label: 'Lead knee flexion', value: '≈ 45°', source: CLINICIAN },
      { label: 'Stride length', value: '≈ 85% of height', source: CLINICIAN },
      { label: 'Hip–shoulder separation', value: '35–60°', source: SEPARATION },
    ],
    load: 'Each extra 9.5 ms that separation holds correlates with about +1 mph of velocity. The spring is the legs and core, not the shoulder.',
  },
  {
    key: 'max-er',
    name: 'Maximum external rotation',
    whats:
      'The arm lays all the way back as the trunk whips through. This is the most loaded instant in the delivery: the shoulder is at the edge of its range and the elbow takes its peak valgus torque — the force trying to bend it backward.',
    pose: {
      pelvis: { x: 150, y: 150 }, shoulder: { x: 152, y: 104 }, head: { x: 160, y: 83 },
      elbow: { x: 150, y: 78 }, hand: { x: 178, y: 70 },
      leadKnee: { x: 212, y: 160 }, leadFoot: { x: 240, y: 214 }, backFoot: { x: 104, y: 210 },
      ball: true,
    },
    readouts: [
      { label: 'Shoulder external rotation', value: '≈ 170°', source: CLINICIAN },
      { label: 'Shoulder abduction', value: '≈ 90°', source: CLINICIAN },
      { label: 'Elbow flexion', value: '≈ 90°, at shoulder height', source: CLINICIAN },
    ],
    load: 'The ulnar collateral ligament carries roughly 55% of the valgus load here. If the chain stalled upstream, the elbow absorbs what the hips and trunk should have.',
  },
  {
    key: 'acceleration',
    name: 'Acceleration',
    whats:
      'From layback to release is about 50 milliseconds. The shoulder fires into internal rotation — the fastest motion the human body produces — and the elbow extends explosively. If the trunk did its job, the big muscles are already helping; if not, the arm is alone.',
    pose: {
      pelvis: { x: 152, y: 150 }, shoulder: { x: 158, y: 104 }, head: { x: 170, y: 86 },
      elbow: { x: 162, y: 90 }, hand: { x: 152, y: 64 },
      leadKnee: { x: 214, y: 158 }, leadFoot: { x: 240, y: 214 }, backFoot: { x: 110, y: 206 },
      ball: true,
    },
    readouts: [
      { label: 'Shoulder internal rotation', value: 'up to 7,500°/s', source: CLINICIAN },
      { label: 'Elbow extension', value: 'up to 2,700°/s', source: CLINICIAN },
    ],
    load: 'Shoulder internal rotation here is the fastest measured human joint motion. The trunk and back have to be still firing to share the work.',
  },
  {
    key: 'release',
    name: 'Ball release',
    whats:
      'The ball leaves out front, over a braced lead leg. The elbow is nearly straight and the trunk has flexed forward, transferring the last of the chain’s energy into the ball. Where the ball is let go sets the release point every tunnel is built on.',
    pose: {
      pelvis: { x: 156, y: 150 }, shoulder: { x: 170, y: 108 }, head: { x: 188, y: 94 },
      elbow: { x: 198, y: 98 }, hand: { x: 226, y: 92 },
      leadKnee: { x: 214, y: 160 }, leadFoot: { x: 240, y: 214 }, backFoot: { x: 120, y: 196 },
      ball: false,
    },
    readouts: [
      { label: 'Elbow flexion', value: '≈ 25°', source: CLINICIAN },
      { label: 'Shoulder abduction', value: '≈ 90°', source: CLINICIAN },
      { label: 'Lead knee flexion', value: '≈ 30°', source: CLINICIAN },
    ],
    load: 'A firm front leg — knee flexion closing from ~45° to ~30° — gives the trunk something to rotate over. A leg that collapses leaks the velocity the chain built.',
  },
  {
    key: 'deceleration',
    name: 'Deceleration & follow-through',
    whats:
      'Active braking. The arm is still moving at thousands of degrees per second and has to be slowed — hard. Done right, the big back and trunk muscles do it eccentrically over a finishing front leg. Done wrong, the shoulder and elbow brake alone. This is where arms break.',
    pose: {
      pelvis: { x: 160, y: 150 }, shoulder: { x: 178, y: 116 }, head: { x: 198, y: 104 },
      elbow: { x: 196, y: 142 }, hand: { x: 168, y: 178 },
      leadKnee: { x: 216, y: 158 }, leadFoot: { x: 240, y: 214 }, backFoot: { x: 138, y: 178 },
      ball: false,
    },
    readouts: [
      { label: 'Arm distraction force', value: 'up to 81% of body weight', source: CLINICIAN },
      { label: 'Braking', value: 'eccentric, by back & trunk', source: KINETIC_PMC },
    ],
    load: 'The same arm that internally rotated at 7,500°/s now has to stop. A finish driven by the lower body spares the elbow and shoulder; a collapsed one hands them the bill.',
  },
]

function Figure({ pose }: { pose: Pose }) {
  const { pelvis, shoulder, head, elbow, hand, leadKnee, leadFoot, backFoot, ball } = pose
  return (
    <svg viewBox="0 0 360 260" className="w-full" role="img" aria-label="Schematic stick figure of the throwing delivery at the current phase. A teaching diagram, not a measured pose or a likeness." xmlns="http://www.w3.org/2000/svg">
      {/* mound + ground */}
      <line x1="0" y1="216" x2="360" y2="216" stroke="var(--color-ink-3)" strokeWidth="1" />
      <path d="M 60 216 Q 150 196 250 216" fill="none" stroke="var(--color-ink-3)" strokeWidth="1" opacity="0.6" />
      <text x="330" y="210" fill="var(--color-ink-3)" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1" textAnchor="end">PLATE →</text>

      {/* back leg */}
      <polyline points={`${pelvis.x},${pelvis.y} ${backFoot.x},${backFoot.y}`} fill="none" stroke="var(--color-ink-2)" strokeWidth="3" strokeLinecap="round" />
      {/* lead leg */}
      <polyline points={`${pelvis.x},${pelvis.y} ${leadKnee.x},${leadKnee.y} ${leadFoot.x},${leadFoot.y}`} fill="none" stroke="var(--color-bone)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* spine */}
      <polyline points={`${pelvis.x},${pelvis.y} ${shoulder.x},${shoulder.y}`} fill="none" stroke="var(--color-bone)" strokeWidth="4" strokeLinecap="round" />
      {/* head */}
      <circle cx={head.x} cy={head.y} r="9" fill="none" stroke="var(--color-bone)" strokeWidth="3" />
      {/* throwing arm */}
      <polyline points={`${shoulder.x},${shoulder.y} ${elbow.x},${elbow.y} ${hand.x},${hand.y}`} fill="none" stroke="var(--color-seam)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* joints */}
      {[pelvis, shoulder, elbow, leadKnee].map((j, i) => (
        <circle key={i} cx={j.x} cy={j.y} r="3" fill="var(--color-bone)" />
      ))}
      {/* the ball */}
      {ball ? <circle cx={hand.x} cy={hand.y} r="4.5" fill="var(--color-seam)" /> : null}
    </svg>
  )
}

export function KineticChain() {
  const [i, setI] = useState(0)
  const phase = PHASES[i]

  return (
    <div className="flex flex-col gap-6">
      {/* scrubber */}
      <div>
        <div className="flex flex-wrap gap-2">
          {PHASES.map((p, idx) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setI(idx)}
              aria-pressed={i === idx}
              aria-current={i === idx ? 'step' : undefined}
              className="rfx-chip"
            >
              {idx + 1}. {p.name}
            </button>
          ))}
        </div>
        <label className="mt-4 block">
          <span className="sr-only">Scrub the delivery phase</span>
          <input
            type="range"
            min={0}
            max={PHASES.length - 1}
            step={1}
            value={i}
            onChange={(e) => setI(e.target.valueAsNumber)}
            className="w-full accent-[var(--color-cyan)]"
            aria-label={`Delivery phase ${i + 1} of ${PHASES.length}: ${phase.name}`}
          />
        </label>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* figure */}
        <figure className="rfx-panel flex flex-col rounded-sm p-4">
          <Figure pose={phase.pose} />
          <figcaption className="mono-label mt-1 text-ink-3">
            Phase {i + 1} / {PHASES.length} · schematic, ground → glove
          </figcaption>
        </figure>

        {/* readouts */}
        <div className="flex flex-col">
          <p className="rfx-skick">{phase.name}</p>
          <p className="mt-2 text-base leading-relaxed text-bone">{phase.whats}</p>

          <div className="mt-5 grid gap-px overflow-hidden rounded-sm border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.12)]">
            {phase.readouts.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between gap-4 bg-[rgba(5,7,12,0.84)] px-4 py-2.5">
                <span className="mono-label">{r.label}</span>
                <a
                  href={r.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={r.source.label}
                  className="font-mono text-sm tabular-nums text-bone underline-offset-2 hover:text-cyan hover:underline"
                >
                  {r.value}
                </a>
              </div>
            ))}
          </div>

          {phase.load ? (
            <p className="rfx-panel mt-4 rounded-sm border-l-2 border-l-[rgba(255,255,255,0.12)] px-4 py-3 text-sm leading-relaxed text-ink-2">
              {phase.load}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
