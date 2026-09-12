export interface Outage {
  start: number
  end: number
  ongoing: boolean
}

function medianGap(timestamps: number[]): number {
  if (timestamps.length < 2) return 0
  const gaps: number[] = []
  for (let i = 1; i < timestamps.length; i += 1) {
    gaps.push(timestamps[i] - timestamps[i - 1])
  }
  gaps.sort((a, b) => a - b)
  return gaps[Math.floor(gaps.length / 2)]
}

// 按历史采样的空档估算断线/上报中断。
// 采样是降采样的，阈值取「中位采样间隔 × 3」，且不低于 3 分钟，避免把正常采样间隔当断线。
export function computeOutages(
  rows: { timestamp: number }[],
  since: number,
  now = Date.now()
): Outage[] {
  const pts = [...rows].sort((a, b) => a.timestamp - b.timestamp)
  const gap = medianGap(pts.map((p) => p.timestamp))
  const threshold = Math.max(gap * 3, 180_000)

  const out: Outage[] = []
  let cursor = since
  for (const p of pts) {
    if (p.timestamp - cursor > threshold) {
      out.push({ start: cursor, end: p.timestamp, ongoing: false })
    }
    cursor = Math.max(cursor, p.timestamp)
  }
  if (now - cursor > threshold) {
    out.push({ start: cursor, end: now, ongoing: true })
  }
  return out
}

export function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return `${minutes} 分钟`
  const hours = Math.floor(minutes / 60)
  const rem = minutes % 60
  if (hours < 24) return rem ? `${hours} 小时 ${rem} 分` : `${hours} 小时`
  const days = Math.floor(hours / 24)
  const h = hours % 24
  return h ? `${days} 天 ${h} 小时` : `${days} 天`
}
