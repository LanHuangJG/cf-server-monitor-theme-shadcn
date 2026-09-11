import { Check, Palette, RotateCcw } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { saveThemeOptions } from '@/lib/api'
import type { ApiConfig } from '@/lib/types'
import { cn } from '@/lib/utils'

const ACCENTS: { value: string; label: string; color: string }[] = [
  { value: 'default', label: '默认', color: '' },
  { value: 'blue', label: '蓝', color: '#3b82f6' },
  { value: 'violet', label: '紫', color: '#8b5cf6' },
  { value: 'emerald', label: '绿', color: '#10b981' },
  { value: 'teal', label: '青', color: '#14b8a6' },
  { value: 'rose', label: '玫红', color: '#f43f5e' },
  { value: 'amber', label: '琥珀', color: '#f59e0b' },
  { value: 'orange', label: '橙', color: '#f97316' },
]

export function ThemeSettings({ config }: { config: ApiConfig }) {
  const options = (config.theme_options || {}) as Record<string, unknown>
  const authorized = config.authorization
  const [accent, setAccent] = React.useState<string>(
    typeof options.accent === 'string' ? options.accent : 'default'
  )
  const [opacity, setOpacity] = React.useState<number>(
    typeof options.cardOpacity === 'number' ? options.cardOpacity : 100
  )
  const [bg, setBg] = React.useState<string>(
    typeof options.bg === 'string' ? options.bg : ''
  )
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  // 实时预览（不落库）
  React.useEffect(() => {
    const root = document.documentElement
    if (accent && accent !== 'default') root.dataset.accent = accent
    else delete root.dataset.accent

    root.style.setProperty('--card-opacity', String(opacity / 100))
    if (opacity < 100) root.dataset.glass = 'true'
    else delete root.dataset.glass

    const url = bg.trim()
    if (url) root.style.setProperty('--theme-bg-image', `url("${url}")`)
    else root.style.removeProperty('--theme-bg-image')
  }, [accent, opacity, bg])

  const onSave = async () => {
    if (!authorized) {
      setMessage('请先登录后台（/admin）再保存')
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      await saveThemeOptions({
        ...options,
        accent: accent === 'default' ? '' : accent,
        cardOpacity: opacity,
        bg: bg.trim(),
      })
      window.location.reload()
    } catch (err) {
      setMessage((err as Error).message)
      setSaving(false)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label="主题设置" title="主题设置">
          <Palette className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">主色</div>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((item) => (
              <button
                key={item.value}
                type="button"
                title={item.label}
                aria-label={item.label}
                onClick={() => setAccent(item.value)}
                className={cn(
                  'flex size-7 items-center justify-center rounded-full border',
                  accent === item.value && 'ring-2 ring-ring ring-offset-1'
                )}
                style={{
                  background:
                    item.color || 'linear-gradient(135deg,#f5f5f5,#737373)',
                }}
              >
                {accent === item.value && (
                  <Check className="size-3.5 text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>卡片透明度</span>
            <span className="text-muted-foreground">{opacity}%</span>
          </div>
          <input
            type="range"
            min={20}
            max={100}
            step={5}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">背景图 URL</div>
          <input
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            placeholder="https://.../bg.jpg"
            className="w-full rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            也可在后台「外观 → 背景图片」设置
          </p>
        </div>

        {message && <p className="text-xs text-destructive">{message}</p>}
        {!authorized && !message && (
          <p className="text-xs text-muted-foreground">
            未登录，仅供预览；保存需先登录后台
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAccent('default')
              setOpacity(100)
              setBg('')
              setMessage(null)
            }}
          >
            <RotateCcw className="size-4" />
            重置
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
