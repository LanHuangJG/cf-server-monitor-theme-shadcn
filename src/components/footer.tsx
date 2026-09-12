import { Skeleton } from '@/components/ui/skeleton'

export function Footer({
  version,
  text,
  loading = false,
}: {
  version?: string
  text?: string
  loading?: boolean
}) {
  if (loading) {
    return (
      <footer className="mt-10 rounded-xl border bg-card px-4 py-6">
        <div className="flex flex-col items-center gap-2.5">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </footer>
    )
  }

  return (
    <footer className="mt-10 rounded-xl border bg-card px-4 py-6 text-center text-xs text-muted-foreground">
      {text && <p className="mb-1">{text}</p>}
      <p>
        Powered by{' '}
        <a
          href="https://github.com/huilang-me/CF-Server-Monitor/"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline-offset-4 hover:underline"
        >
          CF-Server-Monitor
        </a>
        {version ? ` v${version}` : ''}
      </p>
      <p className="mt-1">
        Theme{' '}
        <a
          href="https://github.com/LanHuangJG/cf-server-monitor-theme-shadcn"
          target="_blank"
          rel="noreferrer"
          className="underline-offset-4 hover:underline"
        >
          shadcn
        </a>
      </p>
    </footer>
  )
}
