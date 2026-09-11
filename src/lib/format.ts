// 数值格式化工具。CF-Server-Monitor 的内存 / 磁盘单位为 MB，网络速率为 B/s。

export function formatBytes(bytes?: number, decimals = 1): string {
  if (bytes === undefined || bytes === null || Number.isNaN(bytes)) return '-'
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : decimals)} ${units[i]}`
}

export function formatMB(mb?: number, decimals = 1): string {
  if (mb === undefined || mb === null || Number.isNaN(mb)) return '-'
  return formatBytes(mb * 1024 * 1024, decimals)
}

export function formatSpeed(bytesPerSec?: number): string {
  if (bytesPerSec === undefined || bytesPerSec === null || Number.isNaN(bytesPerSec)) return '-'
  const abs = Math.abs(bytesPerSec)
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.min(Math.floor(Math.log(Math.max(abs, 1)) / Math.log(1024)), units.length - 1)
  const value = bytesPerSec / Math.pow(1024, i)
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function formatPercent(value?: number, decimals = 0): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '-'
  return `${value.toFixed(decimals)}%`
}

export function usedPercent(used?: number, total?: number): number {
  if (!used || !total || total <= 0) return 0
  return Math.min(100, Math.max(0, (used / total) * 100))
}

export function formatUptime(bootTime?: number): string {
  if (!bootTime) return '-'
  const seconds = Math.floor((Date.now() - bootTime) / 1000)
  if (seconds <= 0) return '-'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}天 ${hours}小时`
  if (hours > 0) return `${hours}小时 ${minutes}分`
  return `${minutes}分钟`
}

export function timeAgo(ts?: number): string {
  if (!ts) return '-'
  const diff = Date.now() - ts
  if (diff < 0) return '刚刚'
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}秒前`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000

export function isOnline(server: { last_updated?: number }): boolean {
  return !!server.last_updated && Date.now() - server.last_updated < ONLINE_THRESHOLD_MS
}

export function truncate(text: string | undefined, max = 40): string {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max)}…` : text
}
