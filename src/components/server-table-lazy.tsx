import { lazy, Suspense } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

const ServerTable = lazy(() =>
  import('@/components/server-table').then((m) => ({
    default: m.ServerTable,
  }))
)

// 懒加载表格视图（只有切到表格才加载）
export function ServerTableLazy(
  props: React.ComponentProps<typeof ServerTable>
) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <ServerTable {...props} />
    </Suspense>
  )
}
