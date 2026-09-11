import * as React from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'cfsm-shadcn-theme'

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useTheme(preferred?: string) {
  const [mode, setModeState] = React.useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
    if (preferred === 'light' || preferred === 'dark') return preferred
    return 'system'
  })

  React.useEffect(() => {
    const apply = () => {
      const dark = mode === 'dark' || (mode === 'system' && systemPrefersDark())
      document.documentElement.classList.toggle('dark', dark)
    }
    apply()
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [mode])

  const setMode = React.useCallback((next: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, next)
    setModeState(next)
  }, [])

  const isDark =
    mode === 'system' ? systemPrefersDark() : mode === 'dark'

  return { mode, isDark, setMode }
}
