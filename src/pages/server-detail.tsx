import * as React from 'react'

import {
  ArrowLeft,
  BadgeDollarSign,
  Cpu,
  HardDrive,
  MemoryStick,
  Settings,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { DetailSkeleton } from '@/components/detail-skeleton'
import { Footer } from '@/components/footer'
import { HistoryChart } from '@/components/history-chart'
import { MetricBar } from '@/components/metric-bar'
import { OsIcon } from '@/components/os-icon'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useApp } from '@/hooks/use-app'
import { useServerDetail } from '@/hooks/use-server-detail'
import { formatCNY, remainingValueCNY } from '@/lib/finance'
import { computeOutages, formatDuration } from '@/lib/outages'
import { cn } from '@/lib/utils'
import {
  formatBytes,
  formatExpiry,
  formatMB,
  formatPrice,
  formatSpeed,
  formatUptime,
  isOnline,
  timeAgo,
  formatTrafficPercent,
  trafficLimitBytes,
  trafficUsedBytes,
  usedPercent,
} from '@/lib/format'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

export function ServerDetail() {
  const { id } = useParams<{ id: string }>()
  const { config, prefs, rates, setPref } = useApp()
  const { server, history, hours, setHours, loading, error } = useServerDetail(
    id,
    1
  )
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

  if (!id) return null

  if (!server) {
    if (error) {
      return (
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            加载失败：{error}
          </div>
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
    return <DetailSkeleton />
  }

  const online = isOnline(server)
  const cpu = server.cpu ?? 0
  const ramPercent = usedPercent(server.ram_used, server.ram_total)
  const diskPercent = usedPercent(server.disk_used, server.disk_total)
  const swapPercent = usedPercent(server.swap_used, server.swap_total)

  const limitBytes = trafficLimitBytes(server.traffic_limit)
  const usedBytes = trafficUsedBytes(server)
  const trafficPercent = limitBytes
    ? Math.min(100, (usedBytes / limitBytes) * 100)
    : 0
  const expiry = formatExpiry(server.expire_date)
  const remainingValue = remainingValueCNY(server, rates)
  const tags = (server.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const windowStart = Date.now() - hours * 3_600_000
  const from = Math.max(server.timestamp ?? 0, windowStart)
  const outages = computeOutages(history, from)


  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link to="/" aria-label="返回">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-semibold leading-tight">
                {server.name}
              </h1>
              <Badge variant={online ? 'success' : 'destructive'}>
                {online ? '在线' : '离线'}
              </Badge>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {server.server_group || '未分组'}
              {server.region ? ` · ${server.region}` : ''}
              {` · 更新于 ${timeAgo(server.last_updated)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <a href="/admin#admin" aria-label="管理后台" title="管理后台">
              <Settings className="size-4" />
            </a>
          </Button>
          <ThemeToggle mode={prefs.mode} setMode={(m) => setPref('mode', m)} />
        </div>
      </header>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Cpu className="size-4" /> 资源占用
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MetricBar label="CPU" percent={cpu} value={`${cpu.toFixed(1)}%`} />
              <MetricBar
                label={`内存（${formatMB(server.ram_used)} / ${formatMB(server.ram_total)}）`}
                percent={ramPercent}
                value={`${ramPercent.toFixed(0)}%`}
              />
              <MetricBar
                label={`磁盘（${formatMB(server.disk_used)} / ${formatMB(server.disk_total)}）`}
                percent={diskPercent}
                value={`${diskPercent.toFixed(0)}%`}
              />
              <MetricBar
                label={`Swap（${formatMB(server.swap_used)} / ${formatMB(server.swap_total)}）`}
                percent={swapPercent}
                value={`${swapPercent.toFixed(0)}%`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <HardDrive className="size-4" /> 运行状态
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Stat label="下行速率" value={formatSpeed(server.net_in_speed)} />
              <Stat label="上行速率" value={formatSpeed(server.net_out_speed)} />
              <Stat label="累计下载" value={formatBytes(server.net_rx)} />
              <Stat label="累计上传" value={formatBytes(server.net_tx)} />
              <Separator />
              <Stat label="负载 (1/5/15)" value={server.load_avg || '-'} />
              <Stat label="进程数" value={`${server.processes ?? '-'}`} />
              <Stat
                label="TCP / UDP"
                value={`${server.tcp_conn ?? '-'} / ${server.udp_conn ?? '-'}`}
              />
              <Stat label="运行时长" value={formatUptime(server.boot_time)} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BadgeDollarSign className="size-4" /> 计费与流量
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Stat
                label="价格"
                value={formatPrice(
                  server.price,
                  server.currency,
                  server.billing_cycle
                )}
              />
              {remainingValue > 0 && (
                <Stat label="剩余价值" value={formatCNY(remainingValue)} />
              )}
              <Stat
                label="到期"
                value={
                  expiry.tone === 'destructive'
                    ? expiry.text
                    : expiry.text === '永久'
                      ? server.expire_date || '永久'
                      : `${server.expire_date}（${expiry.text}）`
                }
              />
              <Stat
                label="自动续费"
                value={String(server.auto_renewal) === '1' ? '是' : '否'}
              />
              <Stat
                label="本月流量"
                value={
                  limitBytes
                    ? `${formatBytes(usedBytes)} / ${formatBytes(limitBytes)}`
                    : '无限'
                }
              />
            </div>
            {limitBytes && (
              <>
                <Separator />
                <MetricBar
                  label="流量使用"
                  percent={trafficPercent}
                  value={formatTrafficPercent(trafficPercent)}
                />
              </>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MemoryStick className="size-4" /> 系统信息
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">操作系统</span>
              <span className="flex items-center gap-1.5 font-medium">
                <OsIcon os={server.os} />
                {server.os || '-'}
              </span>
            </div>
            <Stat label="内核" value={server.kernel_version || '-'} />
            <Stat label="架构" value={server.arch || '-'} />
            <Stat
              label="CPU"
              value={
                server.cpu_info
                  ? `${server.cpu_info}${server.cpu_cores ? ` · ${server.cpu_cores} 核` : ''}`
                  : '-'
              }
            />
            <Stat label="探针版本" value={server.agent_version || '-'} />
            <Stat
              label="IPv4 / IPv6"
              value={`${server.ip_v4 ? '有' : '无'} / ${server.ip_v6 ? '有' : '无'}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              历史指标
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HistoryChart
              history={history}
              hours={hours}
              onHoursChange={setHours}
              loading={loading}
              error={error}
              authorized={config?.authorization}
              netNames={netNames}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              断线记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            {outages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                当前时间范围无断线 / 上报中断
              </p>
            ) : (
              <ScrollArea className="max-h-72">
                <div className="space-y-2 pr-1">
                {outages.map((o, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-block size-2 rounded-full bg-destructive',
                          o.ongoing && 'animate-pulse'
                        )}
                      />
                      {new Date(o.start).toLocaleString('zh-CN')} —{' '}
                      {o.ongoing ? '至今' : new Date(o.end).toLocaleString('zh-CN')}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {formatDuration(o.end - o.start)}
                    </span>
                  </div>
                ))}
                </div>
              </ScrollArea>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">
              按历史采样空档估算，阈值随采样间隔自适应
            </p>
          </CardContent>
        </Card>
      </div>

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
