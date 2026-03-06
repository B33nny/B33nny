import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Home } from './pages/Home'
import { TierMap } from './pages/TierMap'
import { PatternCodex } from './pages/PatternCodex'
import { PatternDetail } from './pages/PatternDetail'
import { Library } from './pages/Library'
import { TechniqueDetail } from './pages/TechniqueDetail'
import { DailyPractice } from './pages/DailyPractice'
import { Onboarding } from './pages/Onboarding'
import { LevelRouter } from './pages/LevelRouter'

export const router = createBrowserRouter([
  {
    path: '/onboarding',
    element: <Onboarding />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Home /> },
      { path: 'map', element: <TierMap /> },
      { path: 'codex', element: <PatternCodex /> },
      { path: 'codex/:slug', element: <PatternDetail /> },
      { path: 'library', element: <Library /> },
      { path: 'library/:slug', element: <TechniqueDetail /> },
      { path: 'daily', element: <DailyPractice /> },
      { path: 'level/:id', element: <LevelRouter /> },
    ],
  },
])
