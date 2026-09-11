import * as React from 'react'

import { fetchHistory, fetchServer, wsUrl } from '@/lib/api'
import type { HistoryPoint, Server, WsBatchUpdate } from '@/lib/types'

export function useServerDetail(id: string | undefined, initialHours = 1) {
  const [server, setServer] = React.useState<Server | null>(null)
  const [history, setHistory] = React.useState<HistoryPoint[]>([])
  const [hours, setHours] = React.useState(initialHours)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refreshServer = React.useCallback(async () => {
    if (!id) return
    try {
      const data = await fetchServer(id)
      setServer(data)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [id])

  React.useEffect(() => {
    if (!id) return
    setServer(null)
    refreshServer()
  }, [id, refreshServer])

  React.useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    fetchHistory(id, hours)
      .then((rows) => {
        if (!cancelled) {
          setHistory(rows)
          setError(null)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, hours])

  // 单服务器实时订阅
  React.useEffect(() => {
    if (!id) return
    let ws: WebSocket | null = null
    let timer: ReturnType<typeof setTimeout> | null = null
    let closed = false

    const connect = () => {
      if (document.hidden) return
      closed = false
      const socket = new WebSocket(
        wsUrl(`/api/ws?subscribe=${encodeURIComponent(id)}`)
      )
      ws = socket
      socket.onmessage = (ev) => {
        let msg: WsBatchUpdate
        try {
          msg = JSON.parse(ev.data as string) as WsBatchUpdate
        } catch {
          return
        }
        if (msg.type !== 'batchUpdate') return
        for (const update of msg.updates) {
          for (const sample of update.samples || []) {
            const patch = sample.data || sample.payload || sample.metrics || {}
            setServer((prev) =>
              prev
                ? { ...prev, ...patch, last_updated: sample.ts || Date.now() }
                : prev
            )
          }
        }
      }
      socket.onclose = () => {
        ws = null
        if (closed || document.hidden) return
        timer = setTimeout(connect, 5000)
      }
      socket.onerror = () => {
        try {
          socket.close()
        } catch {
          /* noop */
        }
      }
    }

    const onVisibility = () => {
      if (document.hidden) {
        closed = true
        if (timer) clearTimeout(timer)
        ws?.close()
        ws = null
      } else {
        refreshServer()
        connect()
      }
    }

    connect()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      closed = true
      if (timer) clearTimeout(timer)
      ws?.close()
    }
  }, [id, refreshServer])

  return { server, history, hours, setHours, loading, error, refreshServer }
}
