import type { UptimeInfo } from '@/hooks/use-uptime'
import { cn } from '@/lib/utils'

// OpenStatus 风格的在线率色带：绿=在线，红=离线，灰=接入前/未知
export function UptimeBar({
  info,
  className,
}: {
  info?: UptimeInfo
  className?: string
}) {
  if (!info) return null
  return (
    <div className={className}>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>24h 在线率</span>
        <span className="tabular-nums">
          {info.percent === null ? '—' : `${info.percent.toFixed(1)}%`}
        </span>
      </div>
      <div className="mt-1 flex h-2 gap-[2px]">
        {info.cells.map((cell, i) => (
          <div
            key={i}
            title={
              cell === 'up' ? '在线' : cell === 'down' ? '离线' : '尚未接入'
            }
            className={cn(
              'flex-1 rounded-[1px]',
              cell === 'up'
                ? 'bg-emerald-500'
                : cell === 'down'
                  ? 'bg-destructive/60'
                  : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  )
}
