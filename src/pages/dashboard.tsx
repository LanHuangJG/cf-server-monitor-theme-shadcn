import { Megaphone, Search, Settings, X } from 'lucide-react'
import * as React from 'react'

import { Footer } from '@/components/footer'
import { ServerCard } from '@/components/server-card'
import { SummaryBar } from '@/components/summary-bar'
import { SettingsSheetLazy } from '@/components/settings-sheet-lazy'
import { ServerTableLazy } from '@/components/server-table-lazy'
import { ViewSwitcher, type ViewMode } from '@/components/view-switcher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp } from '@/hooks/use-app'
import { useServers } from '@/hooks/use-servers'
import { isOnline } from '@/lib/format'

export function Dashboard() {
  const { config, prefs, setPref } = useApp()
  const { servers, sysConfig, regionStats, loading, error, connection } =
    useServers(config?.frontend_ws_timeout_minutes ?? 0)
  const [region, setRegion] = React.useState('all')
  const [status, setStatus] = React.useState<'all' | 'online' | 'offline'>(
    'all'
  )
  const [query, setQuery] = React.useState('')
  const [announcementClosed, setAnnouncementClosed] = React.useState(false)
  const view = prefs.view
  const changeView = (next: ViewMode) => setPref('view', next)

  const sorted = React.useMemo(
    () =>
      [...servers].sort(
        (a, b) =>
          (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
          a.name.localeCompare(b.name)
      ),
    [servers]
  )

  const filtered = React.useMemo(() => {
    let list = region === 'all' ? sorted : sorted.filter((s) => s.region === region)
    if (status === 'online') list = list.filter(isOnline)
    else if (status === 'offline') list = list.filter((s) => !isOnline(s))
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((s) =>
        [s.name, s.server_group, s.os, s.region, s.tags, s.cpu_info]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
    }
    return list
  }, [sorted, region, status, query])

  const netNames = React.useMemo(
    () => ({
      ct: config?.custom_ct_name || '电信',
      cu: config?.custom_cu_name || '联通',
      cm: config?.custom_cm_name || '移动',
      bd: config?.custom_bd_name || 'BGP',
    }),
    [
      config?.custom_ct_name,
      config?.custom_cu_name,
      config?.custom_cm_name,
      config?.custom_bd_name,
    ]
  )

  const summary = React.useMemo(() => {
    const online = sorted.filter(isOnline)
    const cpuSum = online.reduce((acc, s) => acc + (s.cpu ?? 0), 0)
    return {
      total: sorted.length,
      online: online.length,
      speedIn: online.reduce((acc, s) => acc + (s.net_in_speed ?? 0), 0),
      speedOut: online.reduce((acc, s) => acc + (s.net_out_speed ?? 0), 0),
      netRx: sorted.reduce((acc, s) => acc + (s.net_rx ?? 0), 0),
      netTx: sorted.reduce((acc, s) => acc + (s.net_tx ?? 0), 0),
      avgCpu: online.length ? cpuSum / online.length : 0,
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
          <SettingsSheetLazy />
          <Button variant="outline" size="icon" asChild>
            <a href="/admin#admin" aria-label="管理后台" title="管理后台">
              <Settings className="size-4" />
            </a>
          </Button>
        </div>
      </header>

      <SummaryBar
        total={summary.total}
        online={summary.online}
        speedIn={summary.speedIn}
        speedOut={summary.speedOut}
        netRx={summary.netRx}
        netTx={summary.netTx}
        avgCpu={summary.avgCpu}
        connection={connection}
        loading={loading}
      />

      {typeof config?.theme_options?.announcement === 'string' &&
        config.theme_options.announcement.trim() &&
        !announcementClosed && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border bg-card px-4 py-3 text-sm">
            <Megaphone className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="flex-1 whitespace-pre-wrap">
              {config.theme_options.announcement}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => setAnnouncementClosed(true)}
              aria-label="关闭公告"
            >
              <X className="size-4" />
            </Button>
          </div>
        )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={status}
            onValueChange={(v) => setStatus(v as 'all' | 'online' | 'offline')}
          >
            <TabsList>
              <TabsTrigger value="all" className="flex-none px-3">
                全部
              </TabsTrigger>
              <TabsTrigger value="online" className="flex-none px-3">
                在线
              </TabsTrigger>
              <TabsTrigger value="offline" className="flex-none px-3">
                离线
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {loading && regions.length === 0 ? (
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-16 rounded-lg" />
              ))}
            </div>
          ) : regions.length > 1 ? (
            <Tabs value={region} onValueChange={setRegion}>
              <TabsList className="h-auto flex-wrap">
                <TabsTrigger value="all" className="flex-none px-3">
                  全部
                </TabsTrigger>
                {regions.map(([code, count]) => (
                  <TabsTrigger
                    key={code}
                    value={code}
                    className="flex-none px-3"
                  >
                    {code} · {count}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索节点…"
              className="w-44 pl-8"
            />
          </div>
          <ViewSwitcher value={view} onChange={changeView} />
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          加载失败：{error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : view === 'table' ? (
        <div className="mt-6">
          <ServerTableLazy
            servers={filtered}
            showPrice={sysConfig?.show_price !== false}
            showExpire={sysConfig?.show_expire !== false}
            showTraffic={sysConfig?.show_tf !== false}
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              variant={view === 'ring' ? 'ring' : 'grid'}
              cardStyle={prefs.cardStyle}
              showPrice={sysConfig?.show_price !== false}
              showExpire={sysConfig?.show_expire !== false}
              showTraffic={sysConfig?.show_tf !== false}
              showThreeNet={sysConfig?.show_three_net_details !== false}
              netNames={netNames}
            />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && !error && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          没有可显示的节点
        </div>
      )}

      <Footer
        version={config?.version}
        text={
          typeof config?.theme_options?.footer === 'string'
            ? config.theme_options.footer
            : ''
        }
      />
    </div>
  )
}
