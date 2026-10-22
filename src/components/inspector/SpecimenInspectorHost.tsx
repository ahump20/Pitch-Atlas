import { lazy, Suspense, type ReactNode } from 'react'
import { pitchBySlug } from '../../data/pitches'
import { InspectorContext } from './inspectorContext'
import { useInspectorParam } from './useInspector'

/*
  Mounts the inspector where cards offer it (the home page) and hands every card
  underneath the handle to open it. The inspector itself is a lazy chunk: nothing
  of it loads until a visitor opens a card or arrives on an ?inspect= link.
*/
const SpecimenInspector = lazy(() => import('./SpecimenInspector'))

export function SpecimenInspectorHost({ children }: { children: ReactNode }) {
  const api = useInspectorParam()
  const entry = api.slug ? pitchBySlug(api.slug) : undefined
  return (
    <InspectorContext.Provider value={api}>
      {children}
      {entry ? (
        <Suspense fallback={null}>
          <SpecimenInspector key={entry.display.slug} entry={entry} onClose={api.close} />
        </Suspense>
      ) : null}
    </InspectorContext.Provider>
  )
}
