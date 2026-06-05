export const meta = {
  name: 'pitch-atlas-craftsmen-research',
  description: 'Source real grips, quotes, and numbers for the Pitch Atlas Craftsmen wing + two new pitch specimens, with an adversarial verification pass so nothing unsourced ships.',
  phases: [
    { title: 'Research', detail: 'one agent per subject, web-sourced, real citations only' },
    { title: 'Verify', detail: 'adversarially confirm each quote and number exists at a real source' },
  ],
}

const RESEARCH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    subject: { type: 'string' },
    kind: { type: 'string', enum: ['craftsman', 'pitch', 'legend'] },
    summary: { type: 'string', description: '2-3 sentence factual overview' },
    signaturePitch: { type: 'string' },
    mentalApproach: { type: 'string', description: 'For craftsmen: how they thought about pitching / their competitive-psychological edge, factual, sourced where possible' },
    grip: { type: 'string', description: 'For pitches: how the pitch is gripped, paraphrased from cited references' },
    physics: { type: 'string', description: 'For pitches: movement profile, velocity band, spin behavior' },
    quotes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          text: { type: 'string', description: 'verbatim quote, no paraphrase' },
          speaker: { type: 'string' },
          context: { type: 'string', description: 'when/where said' },
          sourceUrl: { type: 'string' },
          sourceLabel: { type: 'string' },
          date: { type: 'string' },
          confidence: { type: 'string', enum: ['pitcher-own-words', 'coach-observed', 'reputable-analysis', 'secondhand-attributed', 'unverified'] },
          findable: { type: 'boolean', description: 'true only if you actually found this exact quote at a real reachable URL this run' },
        },
        required: ['text', 'speaker', 'sourceUrl', 'sourceLabel', 'confidence', 'findable'],
      },
    },
    numbers: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          label: { type: 'string' },
          value: { type: 'string' },
          sourceUrl: { type: 'string' },
          sourceLabel: { type: 'string' },
          season: { type: 'string' },
          confidence: { type: 'string', enum: ['official-data', 'reputable-analysis', 'secondhand-attributed', 'unverified'] },
        },
        required: ['label', 'value', 'sourceUrl', 'sourceLabel', 'confidence'],
      },
    },
    masters: {
      type: 'array',
      description: 'For pitches: named arms famous for this pitch, each with a one-line reason and a source',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { pitcher: { type: 'string' }, why: { type: 'string' }, sourceUrl: { type: 'string' } },
        required: ['pitcher', 'why'],
      },
    },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { label: { type: 'string' }, url: { type: 'string' }, note: { type: 'string' } },
        required: ['label', 'url'],
      },
    },
    gaps: { type: 'string', description: 'Explicitly: what you could NOT source. Never fill a gap with invention.' },
  },
  required: ['subject', 'kind', 'summary', 'quotes', 'sources', 'gaps'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    subject: { type: 'string' },
    quoteVerdicts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          text: { type: 'string' },
          foundAtRealSource: { type: 'boolean' },
          bestUrl: { type: 'string' },
          recommendedConfidence: { type: 'string', enum: ['pitcher-own-words', 'coach-observed', 'reputable-analysis', 'secondhand-attributed', 'unverified'] },
          verdict: { type: 'string' },
        },
        required: ['text', 'foundAtRealSource', 'recommendedConfidence', 'verdict'],
      },
    },
    numberVerdicts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          label: { type: 'string' },
          value: { type: 'string' },
          confirmed: { type: 'boolean' },
          bestUrl: { type: 'string' },
          verdict: { type: 'string' },
        },
        required: ['label', 'confirmed', 'verdict'],
      },
    },
    overall: { type: 'string', enum: ['solid', 'partial', 'weak'] },
    keep: { type: 'array', items: { type: 'string' }, description: 'quotes/numbers confirmed at a real source, safe to ship' },
    drop: { type: 'array', items: { type: 'string' }, description: 'quotes/numbers that could not be confirmed and must NOT ship as sourced' },
  },
  required: ['subject', 'quoteVerdicts', 'overall', 'keep', 'drop'],
}

const SUBJECTS = [
  { name: 'Bob Gibson', kind: 'craftsman', focus: 'The slider and fastball as weapons of intimidation; ownership of the inner half; the 1968 season (1.12 ERA). Find at least one REAL verbatim Gibson quote about intimidation, the inside corner, or competitiveness, with a findable source (book or interview relayed in an article is fine but mark secondhand-attributed). His signature pitch was the slider.' },
  { name: 'Nolan Ryan', kind: 'craftsman', focus: 'The fastball + power curve, conviction, longevity (27 seasons), 7 no-hitters, 5,714 career strikeouts. Find a REAL verbatim Ryan quote about the fastball, competing, or longevity. Signature pitch: four-seam fastball (and his curve).' },
  { name: 'Roger Clemens', kind: 'craftsman', focus: 'The split-finger fastball ("Mr. Splittee"), intensity, the two 20-strikeout games. Find a REAL verbatim Clemens quote about the splitter or his competitive approach. Signature pitch: splitter.' },
  { name: 'Greg Maddux', kind: 'craftsman', focus: 'Command, deception, sequencing, the two-seam/changeup, "the thinking man’s pitcher." He has several well-documented quotes about deception, command, and outthinking hitters. Find REAL verbatim Maddux quotes with findable sources. Signature pitch: two-seam fastball / changeup / command.' },
  { name: 'Paul Skenes', kind: 'craftsman', focus: 'The splinker (sinker/splitter hybrid), modern phenom, 2024 NL Rookie of the Year. Find a REAL verbatim Skenes quote about the splinker or his approach (the Yahoo Sports and MLB.com splinker articles carry his words). Signature pitch: splinker.' },
  { name: 'Johan Santana', kind: 'craftsman', focus: 'The changeup as the best of its era, deception off identical fastball arm action, two Cy Youngs (2004, 2006). Find a REAL verbatim Santana (or a catcher/coach) quote about the changeup. Signature pitch: circle changeup.' },
  { name: 'The splitter (split-finger fastball)', kind: 'pitch', focus: 'Canonical grip (ball wedged between split index and middle fingers, off or across the seams), physics (late tumbling drop, thrown a few mph below the fastball, kills spin), and a roster of master arms with sourced reputations: Roger Clemens, Curt Schilling, Masahiro Tanaka, Kevin Gausman, Shohei Ohtani, Bruce Sutter (forkball cousin). Return grip, physics, masters[], and any sourced movement/velocity numbers.' },
  { name: 'The splinker (Skenes sinker-splitter hybrid)', kind: 'pitch', focus: 'Grip (light two-seam split, fingers slightly apart on a two-seam orientation, not wedged deep), physics (~94 mph, ~1750 rpm low spin, sink + arm-side fade off a 99 mph four-seam look), origin (popularized by Jhoan Duran), master arms: Paul Skenes, Jhoan Duran, Mason Miller, Ben Joyce, Hunter Dobbins, Logan Gilbert. Sourced numbers from MLB.com, Yahoo Sports, TribLive, Baseball Savant. Return grip, physics, masters[], numbers[].' },
  { name: 'The gyroball', kind: 'legend', focus: 'The myth-versus-physics story. Real origin: developed via computer simulation by Japanese scientist Ryutaro Himeno and a baseball instructor (verify the second name; often cited as Kazushi Tezuka), intended to reduce arm stress. The myth: a "double-spin" pitch that breaks twice — debunked. Daisuke Matsuzaka association: PITCHf/x analysis suggests he likely did not throw it. The real "gyro spin" (bullet spin) does exist in some sliders. Sources: SABR, University of Illinois physics of baseball, Baseball Prospectus, ESPN, Deadspin. Return summary, the factual origin, the debunk, and sources[]. This ships flagged as legend, never as verified fact.' },
]

phase('Research')

const results = await pipeline(
  SUBJECTS,
  (s) =>
    agent(
      `You are a baseball research librarian for Pitch Atlas, a SOURCED reference whose entire ethos is "Sourced, not corrected." Research: ${s.name} (kind: ${s.kind}).\n\nFocus: ${s.focus}\n\nHARD RULES:\n- Use web search/fetch. Return ONLY facts, quotes, and numbers you can tie to a real, reachable URL this run.\n- Quotes must be VERBATIM. If you only find a paraphrase or a secondhand relay, mark confidence 'secondhand-attributed' and set findable accordingly. NEVER invent or "reconstruct" a quote.\n- Numbers (velocity, spin, break, ERA) must carry a real source URL and season where applicable.\n- If you cannot source something, say so in 'gaps'. A real gap is worth more than a fabricated fill.\n- Prefer the pitcher's own words; a great sourced quote about how they THOUGHT about the pitch is the prize for craftsmen.\nReturn the structured object.`,
      { label: `research:${s.name}`, phase: 'Research', schema: RESEARCH_SCHEMA },
    ),
  (research, s) => {
    if (!research) return null
    return agent(
      `Adversarially verify this research for Pitch Atlas subject "${s.name}". Default to skepticism: a quote or number is NOT confirmed unless you can independently find it at a real, reachable source. For each quote, try to locate the verbatim text online and judge whether it is genuine or likely fabricated/misattributed. For each number, try to confirm it. Recommend the honest confidence tier. Build a keep[] (confirmed, safe to ship as sourced) and a drop[] (could not confirm; must not ship as sourced). Research to verify:\n\n${JSON.stringify(research)}\n\nReturn the structured verdict.`,
      { label: `verify:${s.name}`, phase: 'Verify', schema: VERIFY_SCHEMA },
    ).then((verify) => ({ subject: s.name, kind: s.kind, research, verify }))
  },
)

const clean = results.filter(Boolean)
log(`Researched + verified ${clean.length}/${SUBJECTS.length} subjects`)
return clean
