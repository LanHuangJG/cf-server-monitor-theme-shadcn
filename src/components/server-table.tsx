import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

export function ServerTable({
  servers,
  showPrice = true,
  showExpire = true,
  showTraffic = true,
}: {
  servers: Server[]
  showPrice?: boolean
  showExpire?: boolean
  showTraffic?: boolean
}) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>节点</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>CPU</TableHead>
            <TableHead>内存</TableHead>
            <TableHead>磁盘</TableHead>
            <TableHead>下行</TableHead>
            <TableHead>上行</TableHead>
            {showTraffic && <TableHead>流量</TableHead>}
            {showPrice && <TableHead>价格</TableHead>}
            {showExpire && <TableHead>到期</TableHead>}
            <TableHead>运行</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servers.map((s) => {
            const online = isOnline(s)
            const ram = usedPercent(s.ram_used, s.ram_total)
            const disk = usedPercent(s.disk_used, s.disk_total)
            const limit = trafficLimitBytes(s.traffic_limit)
            const used = trafficUsedBytes(s)
            const expiry = formatExpiry(s.expire_date)
            return (
              <TableRow key={s.id} className="cursor-pointer">
                <TableCell>
                  <Link
                    to={`/server/${s.id}`}
                    className="font-medium hover:underline"
                  >
                    {s.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {s.server_group || '未分组'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={online ? 'success' : 'destructive'}>
                    {online ? '在线' : '离线'}
                  </Badge>
                </TableCell>
                <TableCell className="tabular-nums">
                  {(s.cpu ?? 0).toFixed(1)}%
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatMB(s.ram_used)} / {formatMB(s.ram_total)}（
                  {ram.toFixed(0)}%）
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatMB(s.disk_used)} / {formatMB(s.disk_total)}（
                  {disk.toFixed(0)}%）
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatSpeed(s.net_in_speed)}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatSpeed(s.net_out_speed)}
                </TableCell>
                {showTraffic && (
                  <TableCell className="tabular-nums">
                    {limit
                      ? `${formatBytes(used)} / ${formatBytes(limit)}`
                      : '无限'}
                  </TableCell>
                )}
                {showPrice && (
                  <TableCell className="tabular-nums">
                    {formatPrice(s.price, s.currency, s.billing_cycle)}
                  </TableCell>
                )}
                {showExpire && (
                  <TableCell
                    className={cn(
                      'tabular-nums',
                      expiry.tone === 'destructive' && 'text-destructive',
                      expiry.tone === 'warning' &&
                        'text-amber-600 dark:text-amber-400'
                    )}
                  >
                    {expiry.text}
                  </TableCell>
                )}
                <TableCell className="tabular-nums">
                  {formatUptime(s.boot_time)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
