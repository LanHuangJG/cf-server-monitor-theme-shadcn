import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatSpeed } from '@/lib/format'
import type { HistoryPoint } from '@/lib/types'

type MetricKey = 'cpu' | 'ram' | 'network' | 'load' | 'latency'

const METRICS: { key: MetricKey; label: string }[] = [
  { key: 'cpu', label: 'CPU' },
  { key: 'ram', label: '内存' },
  { key: 'network', label: '网络' },
  { key: 'load', label: '负载' },
  { key: 'latency', label: '三网延迟' },
]

export const RANGES = [
  { label: '1 小时', hours: 1 },
  { label: '6 小时', hours: 6 },
  { label: '24 小时', hours: 24 },
  { label: '7 天', hours: 168 },
]

export interface NetNames {
  ct: string
  cu: string
  cm: string
  bd: string
}

const DEFAULT_NET_NAMES: NetNames = {
  ct: '电信',
  cu: '联通',
  cm: '移动',
  bd: 'BGP',
}

function timeLabel(ts: number, hours: number): string {
  const d = new Date(ts)
  if (hours <= 24) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

const num = (v: unknown): number | null => (typeof v === 'number' ? v : null)

export function HistoryChart({
  history,
  hours,
  onHoursChange,
  loading,
  error,
  netNames = DEFAULT_NET_NAMES,
}: {
  history: HistoryPoint[]
  hours: number
  onHoursChange: (hours: number) => void
  loading: boolean
  error?: string | null
  netNames?: NetNames
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
          ct: num(row.ping_ct),
          cu: num(row.ping_cu),
          cm: num(row.ping_cm),
          bd: num(row.ping_bd),
        }
      }),
    [history]
  )

  const isNetwork = metric === 'network'
  const isLatency = metric === 'latency'

  const config: ChartConfig = isNetwork
    ? {
        netIn: { label: '下行', color: 'var(--chart-1)' },
        netOut: { label: '上行', color: 'var(--chart-3)' },
      }
    : isLatency
      ? {
          ct: { label: netNames.ct, color: 'var(--chart-1)' },
          cu: { label: netNames.cu, color: 'var(--chart-2)' },
          cm: { label: netNames.cm, color: 'var(--chart-4)' },
          bd: { label: netNames.bd, color: 'var(--chart-3)' },
        }
      : {
          [metric]: {
            label: METRICS.find((m) => m.key === metric)?.label ?? metric,
            color: 'var(--chart-1)',
          },
        }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={metric} onValueChange={(v) => setMetric(v as MetricKey)}>
          <TabsList>
            {METRICS.map((m) => (
              <TabsTrigger key={m.key} value={m.key}>
                {m.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Tabs
          value={String(hours)}
          onValueChange={(v) => onHoursChange(Number(v))}
        >
          <TabsList>
            {RANGES.map((r) => (
              <TabsTrigger key={r.hours} value={String(r.hours)}>
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
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
          <ChartContainer config={config} className="aspect-auto h-full w-full">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="t"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(v: number) => timeLabel(v, hours)}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(v: number) =>
                  isNetwork
                    ? formatSpeed(v)
                    : isLatency
                      ? `${Math.round(v)}ms`
                      : `${Math.round(v)}`
                }
                domain={isLatency ? ['auto', 'auto'] : undefined}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(v) =>
                      new Date(Number(v)).toLocaleString('zh-CN')
                    }
                    formatter={(value) =>
                      isNetwork
                        ? formatSpeed(Number(value))
                        : isLatency
                          ? `${Number(value).toFixed(1)} ms`
                          : `${Number(value).toFixed(1)}${metric === 'cpu' || metric === 'ram' ? '%' : ''}`
                    }
                  />
                }
              />
              {isNetwork ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="netIn"
                    stroke="var(--color-netIn)"
                    fill="var(--color-netIn)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="netOut"
                    stroke="var(--color-netOut)"
                    fill="var(--color-netOut)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </>
              ) : isLatency ? (
                <>
                  {(['ct', 'cu', 'cm', 'bd'] as const).map((key) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={`var(--color-${key})`}
                      fill="transparent"
                      fillOpacity={0}
                      strokeWidth={2}
                      connectNulls
                      isAnimationActive={false}
                    />
                  ))}
                </>
              ) : (
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke={`var(--color-${metric})`}
                  fill={`var(--color-${metric})`}
                  fillOpacity={0.2}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
