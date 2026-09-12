import * as React from 'react'
import { Link } from 'react-router-dom'

import { MetricBar } from '@/components/metric-bar'
import { PingSparkline } from '@/components/ping-sparkline'
import { RingGauge } from '@/components/ring-gauge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { NeonGradientCard } from '@/components/ui/neon-gradient-card'
import { Separator } from '@/components/ui/separator'
import { ShineBorder } from '@/components/ui/shine-border'
import {
  formatBytes,
  formatExpiry,
  formatMB,
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
  warning: 'text-amber-600 dark:text-amber-400',
  destructive: 'text-destructive',
}

export function ServerCard({
  server,
  showPrice = true,
  showExpire = true,
  showTraffic = true,
  showThreeNet = false,
  variant = 'grid',
  cardStyle = 'default',
  netNames = { ct: '电信', cu: '联通', cm: '移动', bd: 'BGP' },
}: {
  server: Server
  showPrice?: boolean
  showExpire?: boolean
  showTraffic?: boolean
  showThreeNet?: boolean
  variant?: 'grid' | 'ring'
  cardStyle?: 'default' | 'shine' | 'neon'
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
    { key: 'ct', label: netNames.ct, value: server.ping_ct, loss: server.loss_ct },
    { key: 'cu', label: netNames.cu, value: server.ping_cu, loss: server.loss_cu },
    { key: 'cm', label: netNames.cm, value: server.ping_cm, loss: server.loss_cm },
    { key: 'bd', label: netNames.bd, value: server.ping_bd, loss: server.loss_bd },
  ].filter(
    (n) => typeof n.value === 'number' || typeof n.loss === 'number'
  )
  const hasPing = nets.length > 0
  const pingWindow = server.ping || []

  const showBilling = showPrice || showExpire

  const shine = cardStyle === 'shine'
  const neon = cardStyle === 'neon'

  const card = (
      <Card
        className={cn(
          'h-full gap-4 py-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md',
          shine && 'relative overflow-hidden',
          neon && 'border-0 shadow-none',
          !online && 'opacity-70'
        )}
      >
        {shine && (
          <ShineBorder
            shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']}
            duration={10}
            borderWidth={1.5}
          />
        )}
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
          {variant === 'ring' ? (
            <div className="flex justify-around gap-1 py-1">
              <RingGauge value={cpu} label="CPU" />
              <RingGauge
                value={ramPercent}
                label="内存"
                sublabel={formatMB(server.ram_used)}
              />
              <RingGauge
                value={diskPercent}
                label="磁盘"
                sublabel={formatMB(server.disk_used)}
              />
              {showTraffic && limitBytes && (
                <RingGauge
                  value={trafficPercent}
                  label="流量"
                  sublabel={formatBytes(usedBytes)}
                />
              )}
            </div>
          ) : (
            <>
              <MetricBar label="CPU" percent={cpu} value={`${cpu.toFixed(1)}%`} />
              <MetricBar
                label={`内存 ${ramPercent.toFixed(0)}%`}
                percent={ramPercent}
                value={`${formatMB(server.ram_used)} / ${formatMB(server.ram_total)}`}
              />
              <MetricBar
                label={`磁盘 ${diskPercent.toFixed(0)}%`}
                percent={diskPercent}
                value={`${formatMB(server.disk_used)} / ${formatMB(server.disk_total)}`}
              />

              {showTraffic && limitBytes && (
                <MetricBar
                  label="流量"
                  percent={trafficPercent}
                  value={`${formatBytes(usedBytes)} / ${formatBytes(limitBytes)}`}
                />
              )}
            </>
          )}

          {showThreeNet && hasPing && (
            <div className="space-y-2">
              <div className="flex gap-1">
                {nets.map((n) => (
                  <div
                    key={n.key}
                    className="flex-1 rounded-md bg-muted/50 px-1 py-1 text-center"
                  >
                    <div className="text-[10px] text-muted-foreground">
                      {n.label}
                    </div>
                    <div className="text-xs font-medium tabular-nums">
                      {typeof n.value === 'number' ? n.value : '—'}
                    </div>
                    {typeof n.loss === 'number' && n.loss > 0 && (
                      <div className="text-[10px] font-medium text-destructive">
                        {n.loss}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {pingWindow.length > 1 && <PingSparkline points={pingWindow} />}
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
  )

  return (
    <Link to={`/server/${server.id}`} className="group block">
      {neon ? (
        <NeonGradientCard className="h-full">{card}</NeonGradientCard>
      ) : (
        card
      )}
    </Link>
  )
}
