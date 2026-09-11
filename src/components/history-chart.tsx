import * as React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatSpeed } from '@/lib/format'
import type { HistoryPoint } from '@/lib/types'
import { cn } from '@/lib/utils'

type MetricKey = 'cpu' | 'ram' | 'network' | 'load'

const METRICS: { key: MetricKey; label: string }[] = [
  { key: 'cpu', label: 'CPU' },
  { key: 'ram', label: '内存' },
  { key: 'network', label: '网络' },
  { key: 'load', label: '负载' },
]

export const RANGES = [
  { label: '1 小时', hours: 1 },
  { label: '6 小时', hours: 6 },
  { label: '24 小时', hours: 24 },
  { label: '7 天', hours: 168 },
]

function timeLabel(ts: number, hours: number): string {
  const d = new Date(ts)
  if (hours <= 1) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  if (hours <= 24) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

export function HistoryChart({
  history,
  hours,
  onHoursChange,
  loading,
  error,
}: {
  history: HistoryPoint[]
  hours: number
  onHoursChange: (hours: number) => void
  loading: boolean
  error?: string | null
}) {
  const [metric, setMetric] = React.useState<MetricKey>('cpu')

  const data = React.useMemo(
    () =>
      history.map((row) => {
        const load = row.load_avg ? parseFloat(row.load_avg.split(' ')[0]) : 0
        const ram =
          row.ram_total && row.ram_total > 0
            ? ((row.ram_used ?? 0) / row.ram_total) * 100
            : 0
        return {
          t: row.timestamp,
          cpu: row.cpu ?? 0,
          ram,
          load: Number.isFinite(load) ? load : 0,
          netIn: row.net_in_speed ?? 0,
          netOut: row.net_out_speed ?? 0,
        }
      }),
    [history]
  )

  const isNetwork = metric === 'network'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {METRICS.map((m) => (
            <Button
              key={m.key}
              variant={metric === m.key ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setMetric(m.key)}
            >
              {m.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {RANGES.map((r) => (
            <Button
              key={r.hours}
              variant={hours === r.hours ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onHoursChange(r.hours)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : error ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            历史数据加载失败（{error}）
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            暂无历史数据
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="fillPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillSecondary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-3)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--color-chart-3)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="t"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(v: number) => timeLabel(v, hours)}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                minTickGap={40}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickFormatter={(v: number) =>
                  isNetwork ? formatSpeed(v) : `${Math.round(v)}`
                }
                width={64}
              />
              <Tooltip
                labelFormatter={(v) => new Date(Number(v)).toLocaleString('zh-CN')}
                formatter={(value, name) => [
                  isNetwork ? formatSpeed(Number(value)) : `${Number(value).toFixed(1)}${metric === 'cpu' || metric === 'ram' ? '%' : ''}`,
                  name === 'netIn'
                    ? '下行'
                    : name === 'netOut'
                      ? '上行'
                      : name === 'ram'
                        ? '内存'
                        : name === 'cpu'
                          ? 'CPU'
                          : '负载',
                ]}
                contentStyle={{
                  background: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  color: 'var(--color-popover-foreground)',
                  fontSize: 12,
                }}
              />
              {isNetwork ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="netIn"
                    stroke="var(--color-chart-1)"
                    fill="url(#fillPrimary)"
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="netOut"
                    stroke="var(--color-chart-3)"
                    fill="url(#fillSecondary)"
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </>
              ) : (
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke="var(--color-chart-1)"
                  fill="url(#fillPrimary)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className={cn('flex gap-4 text-xs text-muted-foreground', !isNetwork && 'hidden')}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-[var(--color-chart-1)]" />
          下行
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full bg-[var(--color-chart-3)]" />
          上行
        </span>
      </div>
    </div>
  )
}
