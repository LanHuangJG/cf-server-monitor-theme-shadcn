import { LoaderCircle, Wifi, WifiOff } from 'lucide-react'

import { NumberTicker } from '@/components/number-ticker'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ConnectionState } from '@/hooks/use-servers'
import { formatCNY } from '@/lib/finance'
import { formatBytes, formatSpeed } from '@/lib/format'
import { cn } from '@/lib/utils'

function Item({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 items-baseline gap-2">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="min-w-0 text-sm font-semibold tabular-nums">
        {children}
      </div>
    </div>
  )
}

const GRID = 'grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3 sm:grid-cols-3 xl:grid-cols-6'

export function SummaryBar({
  total,
  online,
  speedIn,
  speedOut,
  netRx,
  netTx,
  avgCpu,
  totalValueCNY,
  remainingValueCNY,
  connection,
  loading,
}: {
  total: number
  online: number
  speedIn: number
  speedOut: number
  netRx: number
  netTx: number
  avgCpu: number
  totalValueCNY?: number
  remainingValueCNY?: number
  connection: ConnectionState
  loading?: boolean
}) {
  if (loading) {
    return (
      <Card className="gap-0 py-0">
        <CardContent className={GRID}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const offline = Math.max(0, total - online)
  const conn = {
    connected: { icon: Wifi, cls: 'text-emerald-500', text: '已连接' },
    connecting: {
      icon: LoaderCircle,
      cls: 'text-amber-500 animate-spin',
      text: '连接中…',
    },
    disconnected: { icon: WifiOff, cls: 'text-destructive', text: '已断开' },
  }[connection]

  return (
    <Card className="gap-0 py-0">
      <CardContent className={GRID}>
        <Item label="在线">
          <NumberTicker value={online} />
          <span className="text-muted-foreground">/ {total}</span>
          <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
            <conn.icon className={cn('size-3.5', conn.cls)} />
            {conn.text}
            {offline > 0 && (
              <span className="text-destructive">· {offline}</span>
            )}
          </span>
        </Item>

        <Item label="实时速率">
          <span>↓ {formatSpeed(speedIn)}</span>
          <span className="block text-muted-foreground sm:ml-2 sm:inline">
            ↑ {formatSpeed(speedOut)}
          </span>
        </Item>

        <Item label="累计流量">
          <span>↓ {formatBytes(netRx)}</span>
          <span className="block text-muted-foreground sm:ml-2 sm:inline">
            ↑ {formatBytes(netTx)}
          </span>
        </Item>

        <Item label="平均 CPU">{avgCpu.toFixed(1)}%</Item>

        <Item label="总价值">{formatCNY(totalValueCNY ?? 0)}</Item>

        <Item label="剩余价值">{formatCNY(remainingValueCNY ?? 0)}</Item>
      </CardContent>
    </Card>
  )
}
