import * as React from 'react'

import { fetchConfig, saveThemeOptions } from '@/lib/api'
import {
  DEFAULT_PREFS,
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
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
  resetPrefs: () => void
  authorized: boolean
  saveAsSiteDefault: () => Promise<void>
}

const AppContext = React.createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<ApiConfig | null>(null)
  const [prefs, setPrefs] = React.useState<Preferences>(() => loadPreferences())
  const hydrated = React.useRef(hasStoredPreferences())

  React.useEffect(() => {
    let cancelled = false
    fetchConfig()
      .then((data) => {
        if (!cancelled) setConfig(data)
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

  const resetPrefs = React.useCallback(() => {
    setPrefs({ ...DEFAULT_PREFS })
    savePreferences(DEFAULT_PREFS)
  }, [])

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

    root.style.setProperty('--card-opacity', String(prefs.cardOpacity / 100))
    if (prefs.cardOpacity < 100) root.dataset.glass = 'true'
    else delete root.dataset.glass

    const url = prefs.bg.trim()
    if (url) {
      root.style.setProperty('--theme-bg-image', `url("${url}")`)
      delete root.dataset.bg
    } else {
      root.style.removeProperty('--theme-bg-image')
      if (prefs.bgPattern) root.dataset.bg = prefs.bgPattern
      else delete root.dataset.bg
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

  const saveAsSiteDefault = React.useCallback(async () => {
    if (!config?.authorization) throw new Error('请先登录后台（/admin）')
    const existing = (config.theme_options || {}) as Record<string, unknown>
    await saveThemeOptions({
      ...existing,
      accent: prefs.accent,
      cardOpacity: prefs.cardOpacity,
      bg: prefs.bg,
      bgPattern: prefs.bgPattern,
    })
  }, [config, prefs])

  const value: AppContextValue = {
    config,
    prefs,
    setPref,
    resetPrefs,
    authorized: !!config?.authorization,
    saveAsSiteDefault,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
