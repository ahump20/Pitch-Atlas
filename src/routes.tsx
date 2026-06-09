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
import { ComparePage } from './pages/ComparePage'
import { GripsPage } from './pages/GripsPage'
import { SoftballHub } from './pages/SoftballHub'
import { SoftballFastpitchPage } from './pages/SoftballFastpitchPage'
import { SoftballSlowpitchPage } from './pages/SoftballSlowpitchPage'
import { SoftballPitchChapter } from './pages/SoftballPitchChapter'
import { SoftballCraftsmanChapter } from './pages/SoftballCraftsmanChapter'
import { AboutPage } from './pages/AboutPage'
import { NotFound } from './pages/NotFound'

/*
  The route map. One layout (masthead + footer + grain) wraps every page. The
  pitch and craftsman pages are dynamic; the index now has its own route, because
  the card grid is no longer just a home-section teaser. Components are imported
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
      { path: 'compare', Component: ComparePage },
      { path: 'grips', Component: GripsPage },
      { path: 'softball', Component: SoftballHub },
      { path: 'softball/fastpitch', Component: SoftballFastpitchPage },
      { path: 'softball/slowpitch', Component: SoftballSlowpitchPage },
      { path: 'softball/pitch/:slug', Component: SoftballPitchChapter },
      { path: 'softball/craftsmen/:slug', Component: SoftballCraftsmanChapter },
      { path: 'about', Component: AboutPage },
      { path: '*', Component: NotFound },
    ],
  },
]
