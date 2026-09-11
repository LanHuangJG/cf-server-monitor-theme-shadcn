import * as React from 'react'

// Magic UI NumberTicker 的零依赖等价实现（requestAnimationFrame 缓动）
export function NumberTicker({
  value,
  decimals = 0,
  className,
}: {
  value: number
  decimals?: number
  className?: string
}) {
  const [display, setDisplay] = React.useState(value)
  const fromRef = React.useRef(value)
  const rafRef = React.useRef(0)

  React.useEffect(() => {
    const from = fromRef.current
    const to = value
    if (from === to) return
    const start = performance.now()
    const duration = 500
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (to - from) * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafRef.current)
      fromRef.current = to
    }
  }, [value])

  return <span className={className}>{display.toFixed(decimals)}</span>
}
