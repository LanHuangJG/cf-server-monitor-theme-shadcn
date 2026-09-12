import * as React from 'react'

import { osIconUrl } from '@/lib/os-icon'

export function OsIcon({
  os,
  className,
}: {
  os?: string
  className?: string
}) {
  const [failed, setFailed] = React.useState(false)
  if (failed) return null
  return (
    <img
      src={osIconUrl(os)}
      alt=""
      className={className ?? 'size-3.5 shrink-0'}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
