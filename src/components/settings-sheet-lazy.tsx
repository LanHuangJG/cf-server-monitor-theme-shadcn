import { Palette } from 'lucide-react'
import { lazy, Suspense, useEffect } from 'react'

import { Button } from '@/components/ui/button'

const SettingsSheet = lazy(() =>
  import('@/components/settings-sheet').then((m) => ({
    default: m.SettingsSheet,
  }))
)

// 懒加载设置面板：大部分人不会打开，不进首屏包
export function SettingsSheetLazy() {
  // 空闲时预取，点开即显示（首屏包不受影响）
  useEffect(() => {
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    const load = () => {
      import('@/components/settings-sheet')
    }
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(load, { timeout: 2500 })
      return () => w.cancelIdleCallback?.(id)
    }
    const t = setTimeout(load, 1500)
    return () => clearTimeout(t)
  }, [])

  return (
    <Suspense
      fallback={
        <Button
          variant="outline"
          size="icon"
          disabled
          aria-label="主题设置"
          title="主题设置"
        >
          <Palette className="size-4" />
        </Button>
      }
    >
      <SettingsSheet />
    </Suspense>
  )
}
