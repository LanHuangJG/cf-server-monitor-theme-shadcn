import { Check, LogIn, Palette, RotateCcw, Save } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp } from '@/hooks/use-app'
import type { BgPattern, ThemeMode, ViewMode } from '@/lib/preferences'
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

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2.5 border-b px-4 pb-4">
      <div className="text-sm font-medium">{title}</div>
      {children}
    </div>
  )
}

export function SettingsSheet() {
  const { prefs, setPref, resetPrefs, authorized, saveAsSiteDefault } = useApp()
  const [bgUrl, setBgUrl] = React.useState(prefs.bg)
  const [message, setMessage] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => setBgUrl(prefs.bg), [prefs.bg])

  const commitBg = () => {
    if (bgUrl.trim() !== prefs.bg) setPref('bg', bgUrl.trim())
  }

  const onSaveSite = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await saveAsSiteDefault()
      setMessage('已设为站点默认（对所有访客生效）')
    } catch (err) {
      setMessage((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="主题设置" title="主题设置">
          <Palette className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-0 p-0">
        <SheetHeader className="border-b">
          <SheetTitle>主题设置</SheetTitle>
          <SheetDescription>
            以下为你的个人偏好，即时生效、仅影响本机。
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-0 overflow-y-auto py-2">
          <Section title="外观">
            <Tabs
              value={prefs.mode}
              onValueChange={(v) => setPref('mode', v as ThemeMode)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="light">浅色</TabsTrigger>
                <TabsTrigger value="dark">深色</TabsTrigger>
                <TabsTrigger value="system">跟随系统</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-wrap gap-2 pt-1">
              {ACCENTS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  title={item.label}
                  aria-label={item.label}
                  onClick={() => setPref('accent', item.value)}
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full border',
                    prefs.accent === item.value &&
                      'ring-2 ring-ring ring-offset-1'
                  )}
                  style={{
                    background:
                      item.color || 'linear-gradient(135deg,#f5f5f5,#737373)',
                  }}
                >
                  {prefs.accent === item.value && (
                    <Check className="size-3.5 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </Section>

          <Section title="背景">
            <Tabs
              value={prefs.bgPattern || 'none'}
              onValueChange={(v) =>
                setPref('bgPattern', (v === 'none' ? '' : v) as BgPattern)
              }
            >
              <TabsList className="w-full">
                <TabsTrigger value="none">无</TabsTrigger>
                <TabsTrigger value="dots">点阵</TabsTrigger>
                <TabsTrigger value="grid">网格</TabsTrigger>
              </TabsList>
            </Tabs>
            <input
              value={bgUrl}
              onChange={(e) => setBgUrl(e.target.value)}
              onBlur={commitBg}
              onKeyDown={(e) => e.key === 'Enter' && commitBg()}
              placeholder="背景图 URL（回车应用）"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </Section>

          <Section title="布局">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">卡片透明度</span>
                <span className="tabular-nums">{prefs.cardOpacity}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                step={5}
                value={prefs.cardOpacity}
                onChange={(e) =>
                  setPref('cardOpacity', Number(e.target.value))
                }
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">默认视图</div>
              <Tabs
                value={prefs.view}
                onValueChange={(v) => setPref('view', v as ViewMode)}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="grid">卡片</TabsTrigger>
                  <TabsTrigger value="table">表格</TabsTrigger>
                  <TabsTrigger value="ring">环形</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </Section>
        </div>

        <SheetFooter className="border-t">
          {message && (
            <p className="text-xs text-muted-foreground">{message}</p>
          )}
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={resetPrefs}>
              <RotateCcw className="size-4" />
              重置本机
            </Button>
            <Button
              size="sm"
              onClick={onSaveSite}
              disabled={saving || !authorized}
              title={authorized ? '写为全站默认' : '需先登录后台'}
            >
              {authorized ? (
                <Save className="size-4" />
              ) : (
                <LogIn className="size-4" />
              )}
              {saving ? '保存中…' : authorized ? '设为站点默认' : '登录后可设为默认'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
