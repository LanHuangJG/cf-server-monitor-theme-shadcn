import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export function MetricBar({
  label,
  percent,
  value,
  className,
}: {
  label: string
  percent: number
  value: string
  className?: string
}) {
  const tone =
    percent >= 90
      ? 'bg-destructive'
      : percent >= 75
        ? 'bg-amber-500'
        : 'bg-primary'

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <Progress value={percent} indicatorClassName={tone} className="h-1.5" />
    </div>
  )
}
