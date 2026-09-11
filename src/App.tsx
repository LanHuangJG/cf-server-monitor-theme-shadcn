import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'

import { DetailSkeleton } from '@/components/detail-skeleton'
import { Dashboard } from '@/pages/dashboard'

const ServerDetail = lazy(() =>
  import('@/pages/server-detail').then((m) => ({ default: m.ServerDetail }))
)

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-svh bg-background">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/server/:id"
            element={
              <Suspense fallback={<DetailSkeleton />}>
                <ServerDetail />
              </Suspense>
            }
          />
        </Routes>
      </div>
    </HashRouter>
  )
}
