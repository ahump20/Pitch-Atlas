/**
 * Pitch Atlas — design-system component layer.
 *
 * Each primitive exposes a clean, typed contract and renders the app's
 * existing, proven branded CSS (`.v2-cta`, `.btn-foil`, `.rfx-*`, `.hairline`).
 * This is a parity-first consolidation, not a reskin — adoption swaps inline
 * duplication for these components without changing what a visitor sees.
 *
 * The three re-exports at the bottom are battle-tested components reused
 * verbatim (the signature objects are never reskinned).
 */
export { Button, type ButtonProps, type ButtonVariant } from './Button'
export { SearchField, type SearchFieldProps } from './SearchField'
export { SourceBadge, type SourceBadgeProps, type SourceTier } from './SourceBadge'
export { Tag, type TagProps } from './Tag'
export { SegmentedToggle, type SegmentedToggleProps, type SegmentedToggleOption } from './SegmentedToggle'
export { Input, type InputProps } from './Input'
export { ScoutRow, type ScoutRowProps, type ScoutTier } from './ScoutRow'
export { DiamondMark, type DiamondMarkProps } from './DiamondMark'
export { Card, type CardProps } from './Card'
export { Stamp, type StampProps } from './Stamp'
export { Kicker, type KickerProps } from './Kicker'
export { Hairline, type HairlineProps } from './Hairline'

// Reused as-is from the existing codebase (never reskinned).
export { ConfidenceDot } from '../provenance/RefractorClaim'
export { BrandMark } from '../brand/BrandMark'
export { PitchSpecimenCard } from '../refractor/PitchSpecimenCard'
