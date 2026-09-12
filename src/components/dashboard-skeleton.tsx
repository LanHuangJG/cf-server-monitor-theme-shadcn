import { Footer } from '@/components/footer'
import { ServerCardSkeleton } from '@/components/server-card'
import { SummaryBar } from '@/components/summary-bar'
import { TableSkeleton } from '@/components/table-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import type { ViewMode } from '@/components/view-switcher'

export function DashboardSkeleton({ view = 'grid' }: { view?: ViewMode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 页头卡片 */}
      <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="size-9 rounded-md" />
          ))}
        </div>
      </div>

      {/* 汇总栏 */}
      <SummaryBar
        total={0}
        online={0}
        speedIn={0}
        speedOut={0}
        netRx={0}
        netTx={0}
        avgCpu={0}
        connection="connecting"
        loading
      />

      {/* 工具栏 */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-44 rounded-lg" />
          <Skeleton className="h-9 w-44 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-44 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* 内容区 */}
      {view === 'table' ? (
        <div className="mt-6">
          <TableSkeleton />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <ServerCardSkeleton
              key={i}
              variant={view === 'ring' ? 'ring' : 'grid'}
            />
          ))}
        </div>
      )}

      <Footer loading />
    </div>
  )
}
