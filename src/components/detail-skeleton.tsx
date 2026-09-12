import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function MetricRow() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-10" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  )
}

function StatRow() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-3.5 w-16" />
      <Skeleton className="h-3.5 w-24" />
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 页头卡片 */}
      <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-52" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
        </div>
      </div>

      <div className="space-y-4">
        {/* 资源占用 / 运行状态 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent className="space-y-4">
              <MetricRow />
              <MetricRow />
              <MetricRow />
              <MetricRow />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent className="space-y-2.5">
              <StatRow />
              <StatRow />
              <StatRow />
              <StatRow />
              <StatRow />
              <StatRow />
            </CardContent>
          </Card>
        </div>

        {/* 计费与流量 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <StatRow />
              <StatRow />
              <StatRow />
              <StatRow />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </CardContent>
        </Card>

        {/* 系统信息 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <StatRow />
            <StatRow />
            <StatRow />
            <StatRow />
            <StatRow />
            <StatRow />
          </CardContent>
        </Card>

        {/* 历史指标 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-14 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-56 w-full rounded-lg" />
          </CardContent>
        </Card>

        {/* 断线记录 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent className="space-y-2.5">
            <StatRow />
            <StatRow />
            <StatRow />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
