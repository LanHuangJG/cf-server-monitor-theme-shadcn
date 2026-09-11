import type {
  ApiConfig,
  HistoryPoint,
  Server,
  ServersResponse,
} from './types'

// 同源部署时 API Base = 当前 origin；
// 跨域 / 静态托管时通过 <meta name="apiBase" content="https://..."> 指定。
function resolveApiBases(): string[] {
  const meta = document.querySelector('meta[name="apiBase"]')?.getAttribute('content') || ''
  const raw = meta.trim() ? meta.split(',') : [window.location.origin]
  return raw
    .map((item) => item.trim().replace(/\/+$/, ''))
    .filter(Boolean)
}

export const API_BASES = resolveApiBases()
export const API_BASE = API_BASES[0]

export function wsUrl(path: string, base: string = API_BASE): string {
  const url = new URL(base + path)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return url.toString()
}

async function getJson<T>(path: string, base: string = API_BASE): Promise<T> {
  const res = await fetch(base + path, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`)
  }
  return (await res.json()) as T
}

export const fetchConfig = () => getJson<ApiConfig>('/api/config')

export const fetchServers = () => getJson<ServersResponse>('/api/servers')

export const fetchServer = (id: string) =>
  getJson<Server>(`/api/server?id=${encodeURIComponent(id)}`)

export const fetchHistory = (id: string, hours: number) =>
  getJson<HistoryPoint[]>(
    `/api/history/all?id=${encodeURIComponent(id)}&hours=${hours}`
  )
