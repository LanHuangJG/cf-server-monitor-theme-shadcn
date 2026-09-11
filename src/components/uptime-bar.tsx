import type { UptimeInfo } from '@/hooks/use-uptime'
import { cn } from '@/lib/utils'

// OpenStatus 风格的在线率色带
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
        <span className="tabular-nums">{info.percent.toFixed(1)}%</span>
      </div>
      <div className="mt-1 flex h-2 gap-[2px]">
        {info.buckets.map((up, i) => (
          <div
            key={i}
            title={up ? '在线' : '离线'}
            className={cn(
              'flex-1 rounded-[1px]',
              up ? 'bg-emerald-500' : 'bg-destructive/60'
            )}
          />
        ))}
      </div>
    </div>
  )
}
