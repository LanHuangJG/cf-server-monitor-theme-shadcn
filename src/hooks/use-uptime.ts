import * as React from 'react'

import { fetchHistory } from '@/lib/api'

export type UptimeCell = 'up' | 'down' | 'unknown'

export interface UptimeInfo {
  cells: UptimeCell[]
  percent: number | null
}

export interface UptimeTarget {
  id: string
  /** 节点接入时间（server.timestamp）；接入前的时段记为未知而不是离线 */
  since?: number
}

// 用历史数据估算近期在线率（按小时分桶）。未登录也允许查 24h。
export function useUptime(targets: UptimeTarget[], hours = 24) {
  const [map, setMap] = React.useState<Record<string, UptimeInfo>>({})
  const key = targets.map((t) => `${t.id}:${t.since ?? ''}`).join(',')

  React.useEffect(() => {
    const items: UptimeTarget[] = key
      ? key.split(',').map((p) => {
          const [id, since] = p.split(':')
          return { id, since: since ? Number(since) : undefined }
        })
      : []
    if (items.length === 0) return
    let cancelled = false

    const run = async () => {
      const results = await Promise.allSettled(
        items.map((item) =>
          fetchHistory(item.id, hours).then(
            (rows) => [item, rows] as const
          )
        )
      )
      if (cancelled) return
      const now = Date.now()
      const span = hours * 3_600_000
      const next: Record<string, UptimeInfo> = {}

      for (const result of results) {
        if (result.status !== 'fulfilled') continue
        const [item, rows] = result.value
        const first = rows.length ? rows[0].timestamp : now
        const since = item.since ?? first
        const cells: UptimeCell[] = Array.from({ length: hours }, () => 'unknown')

        for (let i = 0; i < hours; i += 1) {
          const start = now - span + i * 3_600_000
          const end = start + 3_600_000
          if (end <= since) continue // 尚未接入
          const hasData = rows.some(
            (r) => r.timestamp >= start && r.timestamp < end
          )
          cells[i] = hasData ? 'up' : 'down'
        }

        const measured = cells.filter((c) => c !== 'unknown').length
        const up = cells.filter((c) => c === 'up').length
        next[item.id] = {
          cells,
          percent: measured > 0 ? (up / measured) * 100 : null,
        }
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
