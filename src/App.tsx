import { lazy, Suspense, useEffect, useRef } from 'react'
import {
  HashRouter,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom'

import { DetailSkeleton } from '@/components/detail-skeleton'
import { AppProvider } from '@/hooks/use-app'
import { Dashboard } from '@/pages/dashboard'

const ServerDetail = lazy(() =>
  import('@/pages/server-detail').then((m) => ({ default: m.ServerDetail }))
)

function ScrollManager() {
  const { pathname } = useLocation()
  const navType = useNavigationType()
  const positions = useRef<Record<string, number>>({})

  // 记录每个路由的滚动位置
  useEffect(() => {
    const onScroll = () => {
      positions.current[pathname] = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      positions.current[pathname] = window.scrollY
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname])

  useEffect(() => {
    if (navType === 'POP') {
      // 返回：恢复位置（列表数据异步渲染，重试几次直到高度足够）
      const target = positions.current[pathname] ?? 0
      if (target <= 0) return
      let attempts = 0
      let timer: ReturnType<typeof setTimeout>
      const restore = () => {
        window.scrollTo(0, target)
        attempts += 1
        if (attempts < 10 && Math.abs(window.scrollY - target) > 4) {
          timer = setTimeout(restore, 60)
        }
      }
      restore()
      return () => clearTimeout(timer)
    }
    // 前进：新页面从顶部开始
    window.scrollTo(0, 0)
  }, [pathname, navType])

  return null
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <ScrollManager />
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
    </AppProvider>
  )
}
