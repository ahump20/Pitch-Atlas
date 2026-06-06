import type { RouteObject } from 'react-router-dom'
import { RootLayout } from './components/layout/RootLayout'
import { AtlasHome } from './pages/AtlasHome'
import { PitchChapter } from './pages/PitchChapter'
import { RepertoirePage } from './pages/RepertoirePage'
import { RepertoireChapter } from './pages/RepertoireChapter'
import { CraftsmenHall } from './pages/CraftsmenHall'
import { CraftsmanChapter } from './pages/CraftsmanChapter'
import { LostPitchesHall } from './pages/LostPitchesHall'
import { LostPitchChapter } from './pages/LostPitchChapter'
import { KnowledgeHub } from './pages/KnowledgeHub'
import { KnowledgeChapter } from './pages/KnowledgeChapter'
import { SourcesPage } from './pages/SourcesPage'
import { SandboxPage } from './pages/SandboxPage'
import { MovementMapPage } from './pages/MovementMapPage'
import { NotFound } from './pages/NotFound'

/*
  The route map. One layout (masthead + footer + grain) wraps every page. The
  pitch and craftsman pages are dynamic; the build-time prerender config lists the
  concrete slugs so each gets its own static HTML file. Components are imported
  eagerly so the prerender renders them server-side without resolving lazy
  chunks; the heavy 3D still code-splits behind BallStage's own lazy import.
*/
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: AtlasHome },
      { path: 'pitch/:slug', Component: PitchChapter },
      { path: 'repertoire', Component: RepertoirePage },
      { path: 'repertoire/:id', Component: RepertoireChapter },
      { path: 'craftsmen', Component: CraftsmenHall },
      { path: 'craftsmen/:slug', Component: CraftsmanChapter },
      { path: 'lost-pitches', Component: LostPitchesHall },
      { path: 'lost-pitches/:slug', Component: LostPitchChapter },
      { path: 'learn', Component: KnowledgeHub },
      { path: 'learn/:slug', Component: KnowledgeChapter },
      { path: 'sources', Component: SourcesPage },
      { path: 'sandbox', Component: SandboxPage },
      { path: 'movement-map', Component: MovementMapPage },
      { path: '*', Component: NotFound },
    ],
  },
]
