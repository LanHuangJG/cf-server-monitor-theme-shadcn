import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'

import { DetailSkeleton } from '@/components/detail-skeleton'
import { Dashboard } from '@/pages/dashboard'

const ServerDetail = lazy(() =>
  import('@/pages/server-detail').then((m) => ({ default: m.ServerDetail }))
)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
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
