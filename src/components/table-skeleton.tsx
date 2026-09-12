import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const COLS = [
  'w-24',
  'w-10',
  'w-10',
  'w-28',
  'w-28',
  'w-16',
  'w-16',
  'w-24',
  'w-16',
  'w-16',
  'w-14',
]

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-4 border-b px-4 py-3">
        {COLS.map((w, i) => (
          <Skeleton key={i} className={cn('h-3 shrink-0', w)} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 border-b px-4 py-3.5 last:border-0"
        >
          <div className="w-24 shrink-0 space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-14" />
          </div>
          {COLS.slice(1).map((w, i) => (
            <Skeleton key={i} className={cn('h-3.5 shrink-0', w)} />
          ))}
        </div>
      ))}
    </div>
  )
}
