import { Component, type ReactNode } from 'react'

/*
  If the WebGL scene throws (context loss, driver fault), fall back to the static
  schematic instead of a blank stage. The page never depends on the GPU.
*/
export class SpecimenBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
