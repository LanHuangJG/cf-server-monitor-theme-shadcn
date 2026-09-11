import { Settings } from 'lucide-react'
import * as React from 'react'

import { Footer } from '@/components/footer'
import { ServerCard } from '@/components/server-card'
import { SummaryCards } from '@/components/summary-cards'
import { ThemeSettings } from '@/components/theme-settings'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useConfig } from '@/hooks/use-config'
import { useAppearance } from '@/hooks/use-appearance'
import { useServers } from '@/hooks/use-servers'
import { useTheme } from '@/hooks/use-theme'
import { isOnline } from '@/lib/format'

export function Dashboard() {
  const { config } = useConfig()
  useAppearance(config)
  const { mode, setMode } = useTheme(config?.preferred_theme)
  const { servers, sysConfig, regionStats, loading, error, connected } =
    useServers(config?.frontend_ws_timeout_minutes ?? 0)
  const [region, setRegion] = React.useState('all')

  const sorted = React.useMemo(
    () =>
      [...servers].sort(
        (a, b) =>
          (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
          a.name.localeCompare(b.name)
      ),
    [servers]
  )

  const filtered = React.useMemo(
    () =>
      region === 'all'
        ? sorted
        : sorted.filter((s) => s.region === region),
    [sorted, region]
  )

  const summary = React.useMemo(() => {
    const online = sorted.filter(isOnline)
    return {
      total: sorted.length,
      online: online.length,
      speedIn: online.reduce((acc, s) => acc + (s.net_in_speed ?? 0), 0),
      speedOut: online.reduce((acc, s) => acc + (s.net_out_speed ?? 0), 0),
      netRx: sorted.reduce((acc, s) => acc + (s.net_rx ?? 0), 0),
      netTx: sorted.reduce((acc, s) => acc + (s.net_tx ?? 0), 0),
    }
  }, [sorted])

  const regions = Object.entries(regionStats).sort(
    (a, b) => b[1] - a[1]
  )
  const total = config?.site_title || 'Cloudflare Server Monitor'

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="7" rx="2" />
              <rect x="2" y="14" width="20" height="7" rx="2" />
              <circle cx="6.5" cy="6.5" r="1" fill="currentColor" />
              <circle cx="6.5" cy="17.5" r="1" fill="currentColor" />
            </svg>
          </div>
          <div>
            {config ? (
              <h1 className="text-lg font-semibold leading-tight">{total}</h1>
            ) : (
              <Skeleton className="h-5 w-40" />
            )}
            <p className="text-xs text-muted-foreground">
              由 CF-Server-Monitor 驱动
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {config?.authorization && <ThemeSettings config={config} />}
          <Button variant="outline" size="icon" asChild>
            <a href="/admin#admin" aria-label="管理后台" title="管理后台">
              <Settings className="size-4" />
            </a>
          </Button>
          <ThemeToggle mode={mode} setMode={setMode} />
        </div>
      </header>

      <SummaryCards
        total={summary.total}
        online={summary.online}
        speedIn={summary.speedIn}
        speedOut={summary.speedOut}
        netRx={summary.netRx}
        netTx={summary.netTx}
        connection={connected}
        loading={loading}
      />

      {loading && regions.length === 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-md" />
          ))}
        </div>
      )}

      {!loading && regions.length > 1 && (
        <Tabs value={region} onValueChange={setRegion} className="mt-6">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="all" className="flex-none px-3">
              全部
            </TabsTrigger>
            {regions.map(([code, count]) => (
              <TabsTrigger key={code} value={code} className="flex-none px-3">
                {code} · {count}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          加载失败：{error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))
          : filtered.map((server) => (
              <ServerCard
                key={server.id}
                server={server}
                showPrice={sysConfig?.show_price !== false}
                showExpire={sysConfig?.show_expire !== false}
                showTraffic={sysConfig?.show_tf !== false}
                showThreeNet={sysConfig?.show_three_net_details !== false}
                netNames={{
                  ct: config?.custom_ct_name || '电信',
                  cu: config?.custom_cu_name || '联通',
                  cm: config?.custom_cm_name || '移动',
                  bd: config?.custom_bd_name || 'BGP',
                }}
              />
            ))}
      </div>

      {!loading && filtered.length === 0 && !error && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          没有可显示的节点
        </div>
      )}

      <Footer version={config?.version} />
    </div>
  )
}
