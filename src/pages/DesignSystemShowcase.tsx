import { useState } from 'react'
import { useSeoMeta } from '@unhead/react'
import type { ClaimConfidence } from '../data/types'
import { PITCHES } from '../data/pitches'
import {
  Button,
  type ButtonVariant,
  SearchField,
  SourceBadge,
  type SourceTier,
  Tag,
  SegmentedToggle,
  Input,
  ScoutRow,
  DiamondMark,
  Card,
  Stamp,
  Kicker,
  Hairline,
  ConfidenceDot,
  BrandMark,
  PitchSpecimenCard,
} from '../components/ds'

/*
  The design-system showcase — a live, in-repo gallery of the Pitch Atlas
  component layer (src/components/ds). Every primitive renders the product's
  real, branded CSS, so this page is the system as it actually ships, not a
  re-derivation. Kept out of the public sitemap (SITEMAP_EXCLUDED) and marked
  noindex: an internal reference, prerendered for a clean hard-load.
*/

const CONFIDENCE_TIERS: ClaimConfidence[] = [
  'official-data',
  'pitcher-own-words',
  'coach-observed',
  'reputable-analysis',
  'secondhand-attributed',
  'community-firsthand',
  'unverified',
]

const SOURCE_TIERS: SourceTier[] = ['official', 'reputable', 'secondhand', 'unverified']

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-bone/10 py-10">
      <Kicker>{eyebrow}</Kicker>
      <h2 className="mt-3 mb-6 font-display text-[clamp(22px,3vw,30px)] leading-tight text-bone">{title}</h2>
      {children}
    </section>
  )
}

function ButtonSpec({ variant, arrow, children }: { variant: ButtonVariant; arrow?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant={variant} arrow={arrow}>{children}</Button>
      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-bone-3">variant=&quot;{variant}&quot;</span>
    </div>
  )
}

export function DesignSystemShowcase() {
  useSeoMeta({
    title: 'Design System · Pitch Atlas',
    description: 'The Pitch Atlas component layer (buttons, provenance, forms, and the specimen card) rendered from the real branded styles.',
    robots: 'noindex, nofollow',
  })

  const [tag, setTag] = useState('fastball')
  const [view, setView] = useState('family')
  const [query, setQuery] = useState('')
  const featured = PITCHES[0]

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-12 md:px-8">
      <Stamp style={{ color: 'var(--color-bone)' }}>Internal reference</Stamp>
      <h1 className="mt-4 font-display text-[clamp(34px,6vw,60px)] leading-[0.95] text-bone">
        Pitch Atlas: <em>Design System</em>
      </h1>
      <p className="mt-4 max-w-[60ch] text-[15.5px] leading-relaxed text-bone-2">
        The component layer that ships the product. Each primitive renders the same branded CSS as the live
        site; this gallery is the system as built, not a mock. Sourced, not corrected.
      </p>

      <Section eyebrow="Brand" title="The marks">
        <div className="flex flex-wrap items-end gap-10">
          <BrandMark size="lg" />
          <BrandMark size="md" />
          <BrandMark size="sm" />
          <DiamondMark size={56} />
          <DiamondMark size={56} gold />
        </div>
      </Section>

      <Section eyebrow="Action" title="Button">
        <div className="flex flex-wrap items-start gap-x-6 gap-y-5">
          <ButtonSpec variant="chrome" arrow>Open the Pitch Index</ButtonSpec>
          <ButtonSpec variant="ghost" arrow>Read the mission</ButtonSpec>
          <ButtonSpec variant="foil">Open the atlas</ButtonSpec>
          <ButtonSpec variant="link" arrow>Watch it flatten</ButtonSpec>
        </div>
        {/* the ink variant is the cream-register treatment — shown on a cream swatch where it belongs */}
        <div className="field-cream mt-6 inline-flex flex-wrap items-center gap-3 rounded-lg bg-paper px-5 py-4">
          <Button variant="ink" arrow>On cream</Button>
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">variant=&quot;ink&quot; · cream register</span>
        </div>
      </Section>

      <Section eyebrow="Labels" title="Kicker, Stamp, Tag, Hairline">
        <div className="flex flex-col gap-6">
          <Kicker>The filed set</Kicker>
          <div className="flex flex-wrap gap-3">
            <Stamp>Specimen 00</Stamp>
            <Stamp style={{ color: 'var(--color-cyan)' }}>Sourced, not corrected</Stamp>
          </div>
          <div className="flex flex-wrap gap-2">
            {['fastball', 'breaking', 'offspeed', 'specialty'].map((f) => (
              <Tag as="button" key={f} active={tag === f} onClick={() => setTag(f)}>
                {f}
              </Tag>
            ))}
          </div>
          <div className="max-w-[420px]">
            <Hairline />
            <div className="h-4" />
            <Hairline stage />
          </div>
        </div>
      </Section>

      <Section eyebrow="Input" title="Forms">
        <div className="flex max-w-[520px] flex-col gap-6">
          <SearchField
            aria-label="Search the gallery"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            placeholder="Search a pitch, an alias, a family…"
          />
          <Input label="Contributor handle" placeholder="@you" />
          <SegmentedToggle options={['family', 'era', 'shape']} value={view} onChange={setView} />
        </div>
      </Section>

      <Section eyebrow="Provenance" title="Every claim wears its label">
        <div className="flex flex-col gap-7">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {CONFIDENCE_TIERS.map((c) => (
              <ConfidenceDot key={c} confidence={c} />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {SOURCE_TIERS.map((t) => (
              <SourceBadge key={t} tier={t} />
            ))}
            <SourceBadge tier="reputable" approximate />
            <SourceBadge tier="secondhand" label="Relayed · Kagan" />
          </div>
          <div className="rfx-scout max-w-[640px]">
            <ScoutRow label="Family">Fastball</ScoutRow>
            <ScoutRow label="Grip" tier="reputable">Index and middle across the wide horseshoe seam</ScoutRow>
            <ScoutRow label="Shape" tier="official">Rides: carry at the top of the zone</ScoutRow>
            <ScoutRow label="Tunnel" tier="secondhand">Pairs off the same slot as the change</ScoutRow>
          </div>
        </div>
      </Section>

      <Section eyebrow="Surface" title="Card">
        <div className="grid gap-5 sm:grid-cols-2">
          <Card className="p-5">
            <p className="font-display text-[19px] text-bone">A lifted panel</p>
            <p className="mt-2 text-[14px] leading-relaxed text-bone-2">
              The press surface on the void, marked by a single bone hairline. Leather, never a flat box.
            </p>
          </Card>
          <Card foil className="p-5">
            <p className="font-display text-[19px] text-bone">A foil-edged panel</p>
            <p className="mt-2 text-[14px] leading-relaxed text-bone-2">
              The rainbow refractor frame: the only metallic, the jewelry of the set.
            </p>
          </Card>
        </div>
      </Section>

      <Section eyebrow="Signature" title="The specimen card">
        <div className="max-w-[340px]">
          <PitchSpecimenCard entry={featured} maxWidth={340} foil={false} />
        </div>
      </Section>
    </main>
  )
}
