import { Palette } from 'lucide-react'
import { lazy, Suspense } from 'react'

import { Button } from '@/components/ui/button'

const SettingsSheet = lazy(() =>
  import('@/components/settings-sheet').then((m) => ({
    default: m.SettingsSheet,
  }))
)

// 懒加载设置面板：大部分人不会打开，不进首屏包
export function SettingsSheetLazy() {
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
