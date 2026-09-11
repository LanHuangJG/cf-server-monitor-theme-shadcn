import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'

import { Dashboard } from '@/pages/dashboard'

const ServerDetail = lazy(() =>
  import('@/pages/server-detail').then((m) => ({ default: m.ServerDetail }))
)

function DetailFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
      加载中…
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-svh bg-background">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/server/:id"
            element={
              <Suspense fallback={<DetailFallback />}>
                <ServerDetail />
              </Suspense>
            }
          />
        </Routes>
      </div>
    </HashRouter>
  )
}
