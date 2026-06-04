import { SeamSchematic } from '../fallback/SeamSchematic'

/*
  The specimen actor. In Phase A this is the static SVG schematic, which is the
  honest default: the page is complete with zero WebGL. Phase B layers the 3D
  ball on top when WebGL is present and motion is allowed, falling back to this
  same schematic otherwise. One component, swapped from the inside.
*/
export function PitchSpecimen({ className = '' }: { className?: string }) {
  return <SeamSchematic className={className} />
}
