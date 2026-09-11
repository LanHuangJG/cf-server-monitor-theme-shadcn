import { ArrowDown, ArrowUp, Server } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
}: {
  total: number
  online: number
  speedIn: number
  speedOut: number
  netRx: number
  netTx: number
  connection: boolean
}) {
  const offline = Math.max(0, total - online)
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            在线节点
          </CardTitle>
          <Server className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums">
              {online}
              <span className="text-muted-foreground"> / {total}</span>
            </span>
            {offline > 0 && (
              <Badge variant="destructive">{offline} 离线</Badge>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={cn(
                'inline-block size-1.5 rounded-full',
                connection ? 'bg-success' : 'bg-muted-foreground'
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
          <ArrowDown className="size-4 text-muted-foreground" />
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
          <ArrowDown className="size-4 text-muted-foreground" />
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
          <ArrowUp className="size-4 text-muted-foreground" />
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
