import { Activity, ArrowLeft, WifiOff, TrendingDown } from 'lucide-react'
import * as React from 'react'
import { Link } from 'react-router-dom'

import { Footer } from '@/components/footer'
import { SettingsSheet } from '@/components/settings-sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useApp } from '@/hooks/use-app'
import { useServers } from '@/hooks/use-servers'
import { fetchHistory } from '@/lib/api'
import { hasPacketLoss, isOnline } from '@/lib/format'
import { computeOutages, formatDuration, type Outage } from '@/lib/outages'
import type { HistoryPoint, Server } from '@/lib/types'
import { cn } from '@/lib/utils'

function netLoss(server: Server): number {
  const vals = [server.loss_ct, server.loss_cu, server.loss_cm, server.loss_bd]
    .filter((v): v is number => typeof v === 'number')
  return vals.length ? Math.max(...vals) : 0
}

function hasTimeout(server: Server): boolean {
  return [server.ping_ct, server.ping_cu, server.ping_cm, server.ping_bd].some(
    (v) => (v as unknown) === null
  )
}

interface OutageEvent extends Outage {
  node: string
  nodeId: string
}

export function StatusPage() {
  const { config, prefs, setPref } = useApp()
  const { servers, loading } = useServers(
    config?.frontend_ws_timeout_minutes ?? 0
  )
  const [history, setHistory] = React.useState<Record<string, HistoryPoint[]>>(
    {}
  )

  const ids = React.useMemo(() => servers.map((s) => s.id).join(','), [servers])

  React.useEffect(() => {
    const list = ids ? ids.split(',') : []
    if (list.length === 0) return
    let cancelled = false
    Promise.allSettled(
      list.map((id) => fetchHistory(id, 24).then((rows) => [id, rows] as const))
    ).then((results) => {
      if (cancelled) return
      const map: Record<string, HistoryPoint[]> = {}
      for (const r of results) {
        if (r.status === 'fulfilled') map[r.value[0]] = r.value[1]
      }
      setHistory(map)
    })
    return () => {
      cancelled = true
    }
  }, [ids])

  const windowStart = Date.now() - 24 * 3_600_000

  const online = servers.filter(isOnline)
  const offline = servers.filter((s) => !isOnline(s))
  const lossy = servers
    .map((s) => ({ server: s, loss: netLoss(s) }))
    .filter((x) => x.loss > 0)
    .sort((a, b) => b.loss - a.loss)
  const timeouts = servers.filter(hasTimeout)

  const events: OutageEvent[] = React.useMemo(() => {
    const list: OutageEvent[] = []
    for (const s of servers) {
      const rows = history[s.id]
      if (!rows) continue
      const from = Math.max(s.timestamp ?? 0, windowStart)
      for (const o of computeOutages(rows, from)) {
        list.push({ ...o, node: s.name, nodeId: s.id })
      }
    }
    return list.sort((a, b) => b.start - a.start).slice(0, 30)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servers, history])

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link to="/" aria-label="返回">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-lg font-semibold leading-tight">
              <Activity className="size-5" /> 状态总览
            </h1>
            <p className="text-xs text-muted-foreground">
              近 24 小时异常与事件（数据为采样估算）
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SettingsSheet />
          <ThemeToggle
            mode={prefs.mode}
            setMode={(m) => setPref('mode', m)}
          />
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                在线
              </CardTitle>
              <Activity className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">
                {online.length} / {servers.length}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                离线 {offline.length} 台
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                有丢包
              </CardTitle>
              <TrendingDown className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">
                {lossy.length}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                最高 {lossy[0] ? `${lossy[0].loss}%` : '—'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                延迟超时
              </CardTitle>
              <WifiOff className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">
                {timeouts.length}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                存在超时的节点数
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              异常节点
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...offline, ...lossy.map((x) => x.server)].filter(
              (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i
            ).length === 0 ? (
              <p className="text-sm text-muted-foreground">一切正常</p>
            ) : (
              [...offline, ...lossy.map((x) => x.server)]
                .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i)
                .map((s) => (
                  <Link
                    key={s.id}
                    to={`/server/${s.id}`}
                    className="flex items-center justify-between gap-3 text-sm hover:underline"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-block size-2 rounded-full',
                          isOnline(s) ? 'bg-amber-500' : 'bg-destructive'
                        )}
                      />
                      {s.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {!isOnline(s)
                        ? '离线'
                        : hasPacketLoss(s)
                          ? `丢包 ${netLoss(s)}%`
                          : ''}
                    </span>
                  </Link>
                ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              丢包排行（近 24h 当前值）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lossy.length === 0 ? (
              <p className="text-sm text-muted-foreground">无丢包</p>
            ) : (
              lossy.map(({ server, loss }) => (
                <div
                  key={server.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <Link
                    to={`/server/${server.id}`}
                    className="hover:underline"
                  >
                    {server.name}
                  </Link>
                  <Badge variant={loss >= 10 ? 'destructive' : 'warning'}>
                    {loss}%
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            断线事件（近 24h，采样估算）
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">无断线记录</p>
          ) : (
            <div className="space-y-2">
              {events.map((e, i) => (
                <div
                  key={`${e.nodeId}-${i}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-block size-2 rounded-full bg-destructive',
                        e.ongoing && 'animate-pulse'
                      )}
                    />
                    <Link
                      to={`/server/${e.nodeId}`}
                      className="hover:underline"
                    >
                      {e.node}
                    </Link>
                    <span className="text-muted-foreground">
                      {new Date(e.start).toLocaleString('zh-CN')} —{' '}
                      {e.ongoing
                        ? '至今'
                        : new Date(e.end).toLocaleString('zh-CN')}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatDuration(e.end - e.start)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
