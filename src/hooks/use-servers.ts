import * as React from 'react'

import { fetchServers, wsUrl } from '@/lib/api'
import type {
  Sample,
  Server,
  ServersStats,
  SysConfig,
  WsBatchUpdate,
} from '@/lib/types'

export type ConnectionState = 'connecting' | 'connected' | 'disconnected'

function applySample(server: Server, sample: Sample): Server {
  const patch = sample.data || sample.payload || sample.metrics || {}
  return { ...server, ...patch, last_updated: sample.ts || Date.now() }
}

export function useServers(wsTimeoutMinutes = 0) {
  const [servers, setServers] = React.useState<Server[]>([])
  const [stats, setStats] = React.useState<ServersStats | null>(null)
  const [sysConfig, setSysConfig] = React.useState<SysConfig | undefined>()
  const [regionStats, setRegionStats] = React.useState<Record<string, number>>(
    {}
  )
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [connection, setConnection] = React.useState<ConnectionState>('connecting')

  const serversRef = React.useRef<Server[]>([])
  serversRef.current = servers
  const connectRef = React.useRef<() => void>(() => {})

  const load = React.useCallback(async () => {
    const data = await fetchServers()
    setServers(data.servers)
    setStats(data.stats)
    setSysConfig(data.sysConfig)
    setRegionStats(data.regionStats || {})
    setError(null)
    return data
  }, [])

  React.useEffect(() => {
    let cancelled = false
    load()
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [load])

  React.useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null
    let closedByUs = false

    const cleanupWs = () => {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer)
        timeoutTimer = null
      }
      if (ws) {
        closedByUs = true
        try {
          ws.close()
        } catch {
          /* noop */
        }
        ws = null
      }
      setConnection('disconnected')
    }

    const connect = () => {
      if (document.hidden) return
      if (
        ws &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING)
      ) {
        return
      }
      const ids = serversRef.current.map((s) => s.id)
      if (ids.length === 0) {
        reconnectTimer = setTimeout(connect, 1000)
        return
      }
      closedByUs = false
      setConnection('connecting')
      const socket = new WebSocket(wsUrl('/api/ws?subscribe=all'))
      ws = socket
      socket.onopen = () => {
        setConnection('connected')
        socket.send(JSON.stringify({ type: 'subscribe', scope: 'all', ids }))
        if (wsTimeoutMinutes > 0) {
          timeoutTimer = setTimeout(
            () => cleanupWs(),
            wsTimeoutMinutes * 60_000
          )
        }
      }
      socket.onmessage = (ev) => {
        let msg: WsBatchUpdate
        try {
          msg = JSON.parse(ev.data as string) as WsBatchUpdate
        } catch {
          return
        }
        if (msg.type !== 'batchUpdate') return
        setServers((prev) => {
          const map = new Map(prev.map((s) => [s.id, s]))
          for (const update of msg.updates) {
            for (const sample of update.samples || []) {
              const current = map.get(update.serverId)
              if (current) map.set(update.serverId, applySample(current, sample))
            }
          }
          return prev.map((s) => map.get(s.id) || s)
        })
      }
      socket.onclose = () => {
        setConnection('disconnected')
        ws = null
        if (closedByUs || document.hidden) return
        reconnectTimer = setTimeout(connect, 5000)
      }
      socket.onerror = () => {
        try {
          socket.close()
        } catch {
          /* noop */
        }
      }
    }
    connectRef.current = connect

    const onVisibility = () => {
      if (document.hidden) {
        cleanupWs()
      } else {
        load().catch(() => undefined)
        connect()
      }
    }

    connect()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      if (reconnectTimer) clearTimeout(reconnectTimer)
      cleanupWs()
    }
  }, [load, wsTimeoutMinutes])

  // 列表就绪后立即建立实时连接（不必等空列表的重试）
  React.useEffect(() => {
    if (servers.length > 0) connectRef.current()
  }, [servers.length])

  return {
    servers,
    stats,
    sysConfig,
    regionStats,
    loading,
    error,
    connection,
    reload: load,
  }
}
