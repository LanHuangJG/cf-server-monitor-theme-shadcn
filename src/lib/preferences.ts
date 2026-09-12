export type ThemeMode = 'light' | 'dark' | 'system'
export type ViewMode = 'grid' | 'table' | 'ring'
export type BgPattern = '' | 'dots' | 'grid'
export type CardStyle = 'default' | 'shine' | 'neon'

export interface Preferences {
  mode: ThemeMode
  accent: string
  cardOpacity: number
  bg: string
  bgPattern: BgPattern
  cardStyle: CardStyle
  view: ViewMode
}

export const DEFAULT_PREFS: Preferences = {
  mode: 'system',
  accent: '',
  cardOpacity: 100,
  bg: '',
  bgPattern: '',
  cardStyle: 'default',
  view: 'grid',
}

const STORAGE_KEY = 'cfsm-prefs'

export function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PREFS }
    const parsed = JSON.parse(raw) as Partial<Preferences>
    return { ...DEFAULT_PREFS, ...parsed }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function hasStoredPreferences(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null
}

export function savePreferences(prefs: Preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    /* ignore */
  }
}

// 把站点 theme_options 映射成偏好（作为"站点默认"）
export function prefsFromThemeOptions(
  options: Record<string, unknown>
): Partial<Preferences> {
  const out: Partial<Preferences> = {}
  if (typeof options.accent === 'string') out.accent = options.accent
  if (typeof options.cardOpacity === 'number') {
    out.cardOpacity = options.cardOpacity
  }
  if (typeof options.bg === 'string') out.bg = options.bg
  if (
    options.bgPattern === '' ||
    options.bgPattern === 'dots' ||
    options.bgPattern === 'grid'
  ) {
    out.bgPattern = options.bgPattern
  }
  if (
    options.cardStyle === 'default' ||
    options.cardStyle === 'shine' ||
    options.cardStyle === 'neon'
  ) {
    out.cardStyle = options.cardStyle
  }
  return out
}
