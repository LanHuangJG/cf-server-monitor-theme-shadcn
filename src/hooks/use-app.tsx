import * as React from 'react'

import { fetchConfig } from '@/lib/api'
import {
  DEFAULT_EXCHANGE_RATES,
  getDailyExchangeRates,
  type ExchangeRates,
} from '@/lib/finance'
import {
  hasStoredPreferences,
  loadPreferences,
  prefsFromThemeOptions,
  savePreferences,
  type Preferences,
} from '@/lib/preferences'
import type { ApiConfig } from '@/lib/types'

interface AppContextValue {
  config: ApiConfig | null
  prefs: Preferences
  rates: ExchangeRates
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
}

const AppContext = React.createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<ApiConfig | null>(null)
  const [prefs, setPrefs] = React.useState<Preferences>(() => loadPreferences())
  const [rates, setRates] = React.useState<ExchangeRates>(DEFAULT_EXCHANGE_RATES)
  const hydrated = React.useRef(hasStoredPreferences())

  React.useEffect(() => {
    let cancelled = false
    fetchConfig()
      .then((data) => {
        if (!cancelled) setConfig(data)
      })
      .catch(() => undefined)
    getDailyExchangeRates()
      .then(({ rates: next }) => {
        if (!cancelled) setRates(next)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  // 无本地偏好时，采用站点默认（theme_options / display_mode / preferred_theme）
  React.useEffect(() => {
    if (!config || hydrated.current) return
    const fromTheme = prefsFromThemeOptions(config.theme_options || {})
    const next: Preferences = { ...prefs, ...fromTheme }
    if (config.preferred_theme === 'dark' || config.preferred_theme === 'light') {
      next.mode = config.preferred_theme
    }
    if (config.display_mode === 'table' || config.display_mode === 'ring') {
      next.view = config.display_mode
    }
    setPrefs(next)
    hydrated.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  const setPref = React.useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value }
        savePreferences(next)
        return next
      })
    },
    []
  )

  // 检测服务端注入的 body 背景图，供「文字描边」用
  React.useEffect(() => {
    const bg = window.getComputedStyle(document.body).backgroundImage
    if (bg && bg !== 'none') document.documentElement.dataset.hasBg = 'true'
    else delete document.documentElement.dataset.hasBg
  }, [config])

  // 应用到 DOM
  React.useEffect(() => {
    const root = document.documentElement
    const dark =
      prefs.mode === 'dark' ||
      (prefs.mode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    root.classList.toggle('dark', dark)

    if (prefs.accent && prefs.accent !== 'default') {
      root.dataset.accent = prefs.accent
    } else {
      delete root.dataset.accent
    }
  }, [prefs])

  // 跟随系统模式
  React.useEffect(() => {
    if (prefs.mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => document.documentElement.classList.toggle('dark', mq.matches)
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [prefs.mode])

  const value: AppContextValue = {
    config,
    prefs,
    rates,
    setPref,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
