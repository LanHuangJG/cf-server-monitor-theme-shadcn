import * as React from 'react'

import { fetchConfig } from '@/lib/api'
import type { ApiConfig } from '@/lib/types'

export function useConfig() {
  const [config, setConfig] = React.useState<ApiConfig | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    fetchConfig()
      .then((data) => {
        if (!cancelled) setConfig(data)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { config, error }
}
