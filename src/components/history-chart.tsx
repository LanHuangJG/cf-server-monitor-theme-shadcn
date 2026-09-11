import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatSpeed } from '@/lib/format'
import type { HistoryPoint } from '@/lib/types'

type MetricKey = 'cpu' | 'ram' | 'network' | 'load' | 'latency' | 'loss'

const METRICS: { key: MetricKey; label: string }[] = [
  { key: 'cpu', label: 'CPU' },
  { key: 'ram', label: '内存' },
  { key: 'network', label: '网络' },
  { key: 'load', label: '负载' },
  { key: 'latency', label: '三网延迟' },
  { key: 'loss', label: '丢包' },
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

type NetKey = 'ct' | 'cu' | 'cm' | 'bd'
const NETS: NetKey[] = ['ct', 'cu', 'cm', 'bd']
const LOSS_KEY: Record<NetKey, string> = {
  ct: 'lct',
  cu: 'lcu',
  cm: 'lcm',
  bd: 'lbd',
}

function netColor(key: NetKey): string {
  return key === 'ct'
    ? 'var(--chart-1)'
    : key === 'cu'
      ? 'var(--chart-2)'
      : key === 'cm'
        ? 'var(--chart-4)'
        : 'var(--chart-3)'
}

function timeLabel(ts: number, hours: number): string {
  const d = new Date(ts)
  if (hours <= 24) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

const num = (v: unknown): number | null => (typeof v === 'number' ? v : null)

// 自适应小数位，避免刻度取整后重复（1.5 -> 2）
function formatAxis(v: number): string {
  if (!Number.isFinite(v)) return ''
  if (Math.abs(v) >= 100) return v.toFixed(0)
  if (Math.abs(v) < 1) return String(Number(v.toFixed(2)))
  if (Math.abs(v) < 10) return String(Number(v.toFixed(1)))
  return v.toFixed(0)
}

// 轴上用的紧凑速率（39.3 KB/s -> 39K），避免轴标签过宽被裁
function formatSpeedAxis(v: number): string {
  const abs = Math.abs(v)
  if (abs < 1024) return `${Math.round(v)}B`
  const units = ['K', 'M', 'G', 'T']
  const i = Math.min(Math.floor(Math.log(abs) / Math.log(1024)) - 1, units.length - 1)
  const value = v / Math.pow(1024, i + 1)
  return `${value.toFixed(Math.abs(value) < 10 ? 1 : 0)}${units[i]}`
}

export function HistoryChart({
  history,
  hours,
  onHoursChange,
  loading,
  error,
  netNames = DEFAULT_NET_NAMES,
  authorized = true,
}: {
  history: HistoryPoint[]
  hours: number
  onHoursChange: (hours: number) => void
  loading: boolean
  error?: string | null
  netNames?: NetNames
  authorized?: boolean
}) {
  const [metric, setMetric] = React.useState<MetricKey>('cpu')

  // 未登录时服务端不允许查 >24h 历史
  const ranges = authorized
    ? RANGES
    : RANGES.filter((r) => r.hours <= 24)
  React.useEffect(() => {
    if (!authorized && hours > 24) onHoursChange(24)
  }, [authorized, hours, onHoursChange])

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
          lct: num(row.loss_ct),
          lcu: num(row.loss_cu),
          lcm: num(row.loss_cm),
          lbd: num(row.loss_bd),
        }
      }),
    [history]
  )

  const isNetwork = metric === 'network'
  const isLatency = metric === 'latency'
  const isLoss = metric === 'loss'
  const isMulti = isLatency || isLoss

  const presentKeys = React.useMemo(() => {
    if (isLoss) {
      return NETS.map((n) => LOSS_KEY[n]).filter((k) =>
        data.some((d) => d[k as keyof typeof d] !== null)
      )
    }
    if (isLatency) {
      return NETS.filter((k) => data.some((d) => d[k] !== null))
    }
    return []
  }, [data, isLatency, isLoss])

  const config: ChartConfig = isNetwork
    ? {
        netIn: { label: '下行', color: 'var(--chart-1)' },
        netOut: { label: '上行', color: 'var(--chart-3)' },
      }
    : isMulti
      ? Object.fromEntries(
          presentKeys.map((k) => {
            const net = (isLoss
              ? (Object.entries(LOSS_KEY).find(([, v]) => v === k)?.[0] as NetKey)
              : (k as NetKey)) as NetKey
            return [
              k,
              {
                label: netNames[net],
                color: netColor(net),
              },
            ]
          })
        )
      : {
          [metric]: {
            label: METRICS.find((m) => m.key === metric)?.label ?? metric,
            color: 'var(--chart-1)',
          },
        }

  const hasSeries = !isMulti || presentKeys.length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={metric} onValueChange={(v) => setMetric(v as MetricKey)}>
          <TabsList className="h-auto flex-wrap">
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
            {ranges.map((r) => (
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
        ) : !hasSeries ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            暂无数据
          </div>
        ) : (
          <ChartContainer config={config} className="aspect-auto h-full w-full">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
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
                tickMargin={6}
                domain={isLatency ? ['auto', 'auto'] : isLoss ? [0, 'auto'] : undefined}
                tickFormatter={(v: number) =>
                  isNetwork
                    ? formatSpeedAxis(v)
                    : isLatency
                      ? `${Math.round(v)}ms`
                      : isLoss
                        ? `${Math.round(v)}%`
                        : formatAxis(v)
                }
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
                          : isLoss
                            ? `${Number(value).toFixed(1)}%`
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
              ) : isMulti ? (
                <>
                  {presentKeys.map((key) => (
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
              {(isNetwork || isMulti) && (
                <ChartLegend content={<ChartLegendContent />} />
              )}
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
