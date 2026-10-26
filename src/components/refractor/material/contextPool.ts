/*
  A browser keeps only so many live WebGL contexts (about sixteen) before it starts
  evicting the oldest. The home page already spends contexts on the grip model and the
  seam bridge, so the card material caps its own at eight: the hero, the filed set,
  the discovery card, one turned-over back and the inspector's two faces, with
  in-view gating releasing whatever has scrolled away. Past the cap a card simply
  keeps its CSS stand-in, which is the same ramp at rest, so identity never changes,
  only motion.
*/
export const MATERIAL_CONTEXT_CAP = 8

let live = 0

export function acquireMaterialContext(): boolean {
  if (live >= MATERIAL_CONTEXT_CAP) return false
  live += 1
  return true
}

export function releaseMaterialContext(): void {
  live = Math.max(0, live - 1)
}

export function liveMaterialContexts(): number {
  return live
}
