import { Monitor, Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { ThemeMode } from '@/hooks/use-theme'

const ORDER: ThemeMode[] = ['light', 'dark', 'system']

export function ThemeToggle({
  mode,
  setMode,
}: {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}) {
  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]
  const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor
  const label =
    mode === 'light' ? '浅色' : mode === 'dark' ? '深色' : '跟随系统'

  return (
    <Button
      variant="outline"
      size="icon"
      title={`外观：${label}（点击切换）`}
      aria-label={`外观：${label}（点击切换）`}
      onClick={() => setMode(next)}
    >
      <Icon className="size-4" />
    </Button>
  )
}
