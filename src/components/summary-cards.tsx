import { ArrowDown, ArrowUp, Server } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatBytes, formatSpeed } from '@/lib/format'
import { cn } from '@/lib/utils'

export function SummaryCards({
  total,
  online,
  speedIn,
  speedOut,
  netRx,
  netTx,
  connection,
  loading,
}: {
  total: number
  online: number
  speedIn: number
  speedOut: number
  netRx: number
  netTx: number
  connection: boolean
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-4 rounded-sm" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const offline = Math.max(0, total - online)
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            在线节点
          </CardTitle>
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Server className="size-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums">
              {online}
              <span className="text-muted-foreground"> / {total}</span>
            </span>
            {offline > 0 && <Badge variant="destructive">{offline} 离线</Badge>}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={cn(
                'inline-block size-1.5 rounded-full',
                connection ? 'bg-emerald-500' : 'bg-muted-foreground'
              )}
            />
            {connection ? '实时连接中' : '实时连接已断开'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            实时速率
          </CardTitle>
          <span className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ArrowDown className="size-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tabular-nums">
            {formatSpeed(speedIn)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            上传 {formatSpeed(speedOut)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            累计下载
          </CardTitle>
          <span className="flex size-7 items-center justify-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <ArrowDown className="size-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tabular-nums">
            {formatBytes(netRx)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">自启动以来累计</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            累计上传
          </CardTitle>
          <span className="flex size-7 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <ArrowUp className="size-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tabular-nums">
            {formatBytes(netTx)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">自启动以来累计</p>
        </CardContent>
      </Card>
    </div>
  )
}
