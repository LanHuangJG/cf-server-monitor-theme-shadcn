import { NumberTicker } from '@/components/number-ticker'

export function RingGauge({
  value,
  label,
  sublabel,
}: {
  value: number
  label: string
  sublabel?: string
}) {
  const pct = Math.min(100, Math.max(0, value))
  const r = 26
  const c = 2 * Math.PI * r
  const stroke =
    pct >= 90
      ? 'var(--color-destructive)'
      : pct >= 75
        ? 'var(--color-chart-4)'
        : 'var(--color-primary)'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          className="-rotate-90"
          role="img"
          aria-label={`${label} ${pct.toFixed(0)}%`}
        >
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth="6"
          />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct / 100)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums">
          <NumberTicker value={pct} />%
        </div>
      </div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      {sublabel && (
        <div className="text-[10px] text-muted-foreground/80">{sublabel}</div>
      )}
    </div>
  )
}
