import * as React from 'react'

import { fetchHistory } from '@/lib/api'

export interface UptimeInfo {
  buckets: boolean[]
  percent: number
}

// 用历史数据估算近期在线率（按小时分桶）。未登录也允许查 24h。
export function useUptime(ids: string[], hours = 24) {
  const [map, setMap] = React.useState<Record<string, UptimeInfo>>({})
  const key = ids.join(',')

  React.useEffect(() => {
    const list = key ? key.split(',') : []
    if (list.length === 0) return
    let cancelled = false

    const run = async () => {
      const results = await Promise.allSettled(
        list.map((id) =>
          fetchHistory(id, hours).then((rows) => [id, rows] as const)
        )
      )
      if (cancelled) return
      const now = Date.now()
      const span = hours * 3_600_000
      const next: Record<string, UptimeInfo> = {}
      for (const result of results) {
        if (result.status !== 'fulfilled') continue
        const [id, rows] = result.value
        const buckets = Array.from({ length: hours }, () => false)
        for (const row of rows) {
          const idx = Math.min(
            hours - 1,
            Math.max(0, Math.floor((row.timestamp - (now - span)) / 3_600_000))
          )
          buckets[idx] = true
        }
        const online = buckets.filter(Boolean).length
        next[id] = { buckets, percent: (online / hours) * 100 }
      }
      setMap(next)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [key, hours])

  return map
}
