import { Heart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useApp } from '@/hooks/use-app'

const DEFAULT_GITHUB =
  'https://github.com/LanHuangJG/cf-server-monitor-theme-shadcn'

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  )
}

function readUrl(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function SocialLinks() {
  const { config } = useApp()
  const options = config?.theme_options || {}
  const github = readUrl(options.github) || DEFAULT_GITHUB
  const afdian = readUrl(options.afdian)

  return (
    <>
      {github && (
        <Button variant="outline" size="icon" asChild>
          <a
            href={github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            title="GitHub"
          >
            <GitHubIcon className="size-4" />
          </a>
        </Button>
      )}
      {afdian && (
        <Button variant="outline" size="icon" asChild>
          <a
            href={afdian}
            target="_blank"
            rel="noreferrer"
            aria-label="爱发电"
            title="爱发电"
          >
            <Heart className="size-4" />
          </a>
        </Button>
      )}
    </>
  )
}
