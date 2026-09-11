import type { PingPoint } from '@/lib/types'

const NETS = [
  { key: 'ct', color: 'var(--chart-1)' },
  { key: 'cu', color: 'var(--chart-2)' },
  { key: 'cm', color: 'var(--chart-4)' },
  { key: 'bd', color: 'var(--chart-3)' },
] as const

export function PingSparkline({ points }: { points?: PingPoint[] }) {
  const data = (points || []).filter((p) => p && typeof p.ts === 'number')
  if (data.length < 2) return null

  const values: number[] = []
  for (const p of data) {
    for (const net of NETS) {
      const v = p[net.key]
      if (typeof v === 'number') values.push(v)
    }
  }
  if (values.length === 0) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const w = 100
  const h = 28
  const posX = (i: number) => (i / (data.length - 1)) * w
  const posY = (v: number) => h - 3 - ((v - min) / span) * (h - 6)

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-7 w-full"
      role="img"
      aria-label="三网延迟走势"
    >
      {NETS.map(({ key, color }) => {
        const paths: string[] = []
        let d = ''
        data.forEach((p, i) => {
          const v = p[key]
          if (typeof v === 'number') {
            d += `${d ? 'L' : 'M'}${posX(i).toFixed(1)},${posY(v).toFixed(1)}`
          } else if (d) {
            paths.push(d)
            d = ''
          }
        })
        if (d) paths.push(d)
        return paths.map((dd, idx) => (
          <path
            key={`${key}-${idx}`}
            d={dd}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))
      })}
    </svg>
  )
}
