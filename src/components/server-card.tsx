import * as React from 'react'
import { Link } from 'react-router-dom'

import { MetricBar } from '@/components/metric-bar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  formatBytes,
  formatExpiry,
  formatPrice,
  formatSpeed,
  formatUptime,
  isOnline,
  trafficLimitBytes,
  trafficUsedBytes,
  usedPercent,
} from '@/lib/format'
import type { Server } from '@/lib/types'
import { cn } from '@/lib/utils'

function flagUrl(region?: string): string | null {
  if (!region) return null
  const code = region.trim().toLowerCase()
  if (!/^[a-z]{2}$/.test(code)) return null
  return `/flags/${code}.svg`
}

function Flag({ region }: { region?: string }) {
  const [failed, setFailed] = React.useState(false)
  const url = flagUrl(region)
  if (!region) return <span className="text-base leading-none">🌐</span>
  if (!url || failed) {
    return (
      <Badge variant="outline" className="shrink-0 text-[10px]">
        {region}
      </Badge>
    )
  }
  return (
    <img
      src={url}
      alt={region}
      className="h-4 w-6 shrink-0 rounded-[2px] object-cover"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

const EXPIRY_TONE: Record<string, string> = {
  muted: 'text-muted-foreground',
  warning: 'text-warning',
  destructive: 'text-destructive',
}

export function ServerCard({
  server,
  showPrice = true,
  showExpire = true,
  showTraffic = true,
  showThreeNet = false,
  netNames = { ct: '电信', cu: '联通', cm: '移动', bd: 'BGP' },
}: {
  server: Server
  showPrice?: boolean
  showExpire?: boolean
  showTraffic?: boolean
  showThreeNet?: boolean
  netNames?: { ct: string; cu: string; cm: string; bd: string }
}) {
  const online = isOnline(server)
  const cpu = server.cpu ?? 0
  const ramPercent = usedPercent(server.ram_used, server.ram_total)
  const diskPercent = usedPercent(server.disk_used, server.disk_total)

  const limitBytes = trafficLimitBytes(server.traffic_limit)
  const usedBytes = trafficUsedBytes(server)
  const trafficPercent = limitBytes
    ? Math.min(100, (usedBytes / limitBytes) * 100)
    : 0
  const expiry = formatExpiry(server.expire_date)
  const tags = (server.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const nets = [
    { key: 'ct', label: netNames.ct, value: server.ping_ct },
    { key: 'cu', label: netNames.cu, value: server.ping_cu },
    { key: 'cm', label: netNames.cm, value: server.ping_cm },
    { key: 'bd', label: netNames.bd, value: server.ping_bd },
  ]
  const hasPing = nets.some((n) => typeof n.value === 'number')

  const showBilling = showPrice || showExpire

  return (
    <Link to={`/server/${server.id}`} className="group block">
      <Card
        className={cn(
          'h-full gap-4 py-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md',
          !online && 'opacity-70'
        )}
      >
        <CardHeader className="px-5 pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Flag region={server.region} />
              <div className="min-w-0">
                <div className="truncate font-semibold leading-tight">
                  {server.name}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {server.server_group || '未分组'}
                </div>
              </div>
            </div>
            <Badge variant={online ? 'success' : 'destructive'}>
              {online ? '在线' : '离线'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-5">
          <MetricBar label="CPU" percent={cpu} value={`${cpu.toFixed(1)}%`} />
          <MetricBar
            label="内存"
            percent={ramPercent}
            value={`${ramPercent.toFixed(0)}%`}
          />
          <MetricBar
            label="磁盘"
            percent={diskPercent}
            value={`${diskPercent.toFixed(0)}%`}
          />

          {showTraffic && limitBytes && (
            <MetricBar
              label="流量"
              percent={trafficPercent}
              value={`${formatBytes(usedBytes)} / ${formatBytes(limitBytes)}`}
            />
          )}

          {showThreeNet && hasPing && (
            <div className="grid grid-cols-4 gap-1">
              {nets.map((n) => (
                <div
                  key={n.key}
                  className="rounded-md bg-muted/50 px-1 py-1 text-center"
                >
                  <div className="text-[10px] text-muted-foreground">
                    {n.label}
                  </div>
                  <div className="text-xs font-medium tabular-nums">
                    {typeof n.value === 'number' ? n.value : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">下行</span>
              <span className="font-medium tabular-nums">
                {formatSpeed(server.net_in_speed)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">上行</span>
              <span className="font-medium tabular-nums">
                {formatSpeed(server.net_out_speed)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">负载</span>
              <span className="font-medium tabular-nums">
                {server.load_avg?.split(' ')[0] ?? '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">运行</span>
              <span className="font-medium tabular-nums">
                {formatUptime(server.boot_time)}
              </span>
            </div>
          </div>

          {showBilling && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">
                {showPrice
                  ? formatPrice(
                      server.price,
                      server.currency,
                      server.billing_cycle
                    )
                  : ''}
              </span>
              <span className={cn('font-medium', EXPIRY_TONE[expiry.tone])}>
                {showExpire ? expiry.text : ''}
              </span>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="truncate text-[11px] text-muted-foreground">
            {server.os || '-'}
            {server.cpu_cores ? ` · ${server.cpu_cores} 核` : ''}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
