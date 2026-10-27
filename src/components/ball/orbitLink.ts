/*
  Two ball stages on one camera. Each stage's orbit controls report where the reader
  turned them; while the link is on, the other stage takes the same angle. Only the
  stage the reader is actually dragging (the driver) publishes, and a stage never
  hears its own pose back, so one turn can never echo between the two. Linking again,
  or a second stage joining, brings it to the angle last turned. Reset fans out to every stage,
  linked or not, so the pair always comes home together.
  No React: the canvases subscribe from inside their own render loops.
*/
export type StageId = 'a' | 'b'
export interface CameraPose {
  azimuth: number
  polar: number
}

export interface OrbitLink {
  readonly linked: boolean
  setLinked(linked: boolean): void
  /** the stage the reader last took hold of */
  drive(id: StageId): void
  publish(from: StageId, pose: CameraPose): void
  subscribe(id: StageId, apply: (pose: CameraPose) => void): () => void
  reset(): void
  onReset(fn: () => void): () => void
}

export function createOrbitLink(): OrbitLink {
  let linked = true
  let driver: StageId | null = null
  let last: CameraPose | null = null
  const receivers = new Map<StageId, (pose: CameraPose) => void>()
  const resets = new Set<() => void>()
  return {
    get linked() {
      return linked
    },
    setLinked(next) {
      linked = next
      if (!linked || !driver || !last) return
      for (const [id, apply] of receivers) if (id !== driver) apply(last)
    },
    drive(id) {
      driver = id
    },
    publish(from, pose) {
      if (driver !== from) return
      last = pose
      if (!linked) return
      for (const [id, apply] of receivers) if (id !== from) apply(pose)
    },
    subscribe(id, apply) {
      receivers.set(id, apply)
      // a stage that joins a linked bench starts at the angle the other already holds
      if (linked && last) apply(last)
      return () => {
        if (receivers.get(id) === apply) receivers.delete(id)
      }
    },
    reset() {
      last = null
      for (const fn of resets) fn()
    },
    onReset(fn) {
      resets.add(fn)
      return () => {
        resets.delete(fn)
      }
    },
  }
}
