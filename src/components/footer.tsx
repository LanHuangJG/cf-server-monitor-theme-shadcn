export function Footer({ version }: { version?: string }) {
  return (
    <footer className="mt-10 border-t py-6 text-center text-xs text-muted-foreground">
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
