import { LoaderCircle, Wifi, WifiOff } from 'lucide-react'

import { NumberTicker } from '@/components/number-ticker'
import { Badge } from '@/components/ui/badge'
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
    <div className="flex items-baseline gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{children}</span>
    </div>
  )
}

export function SummaryBar({
  total,
  online,
  speedIn,
  speedOut,
  netRx,
  netTx,
  avgCpu,
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
  remainingValueCNY?: number
  connection: ConnectionState
  loading?: boolean
}) {
  if (loading) {
    return <Skeleton className="h-14 w-full rounded-xl" />
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
      <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <Item label="在线">
            <NumberTicker value={online} />
            <span className="text-muted-foreground"> / {total}</span>
          </Item>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <conn.icon className={cn('size-3.5', conn.cls)} />
            {conn.text}
          </span>
          {offline > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              {offline} 离线
            </Badge>
          )}
        </div>

        <div className="hidden h-4 w-px bg-border sm:block" />

        <Item label="实时速率">
          <span>↓ {formatSpeed(speedIn)}</span>
          <span className="ml-2 text-muted-foreground">
            ↑ {formatSpeed(speedOut)}
          </span>
        </Item>

        <div className="hidden h-4 w-px bg-border sm:block" />

        <Item label="累计流量">
          <span>↓ {formatBytes(netRx)}</span>
          <span className="ml-2 text-muted-foreground">
            ↑ {formatBytes(netTx)}
          </span>
        </Item>

        <div className="hidden h-4 w-px bg-border sm:block" />

        <Item label="平均 CPU">{avgCpu.toFixed(1)}%</Item>

        {remainingValueCNY != null && remainingValueCNY > 0 && (
          <>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <Item label="剩余价值">{formatCNY(remainingValueCNY)}</Item>
          </>
        )}
      </CardContent>
    </Card>
  )
}
