import * as React from 'react'

import type { ApiConfig } from '@/lib/types'

// 主题自定义配置（theme_options）：
//   accent      主色预设：default / blue / violet / emerald / teal / rose / amber / orange
//   cardOpacity 卡片透明度 20-100（100 = 不透明，shadcn 默认）
//   bg          背景图 URL（也可用后台「外观→背景图片」）
//   bgPattern   背景纹理：'' | dots | grid（有背景图时以图为准）
//   footer      自定义页脚文字
export function useAppearance(config: ApiConfig | null) {
  React.useEffect(() => {
    const root = document.documentElement
    const options = (config?.theme_options || {}) as Record<string, unknown>

    const bg = typeof options.bg === 'string' ? options.bg.trim() : ''
    const pattern =
      typeof options.bgPattern === 'string' ? options.bgPattern.trim() : ''

    if (bg) {
      root.style.setProperty('--theme-bg-image', `url("${bg}")`)
      delete root.dataset.bg
    } else {
      root.style.removeProperty('--theme-bg-image')
      if (pattern === 'dots' || pattern === 'grid') {
        root.dataset.bg = pattern
      } else {
        delete root.dataset.bg
      }
    }

    const accent =
      typeof options.accent === 'string' ? options.accent.trim() : ''
    if (accent && accent !== 'default') {
      root.dataset.accent = accent
    } else {
      delete root.dataset.accent
    }

    const raw = Number(options.cardOpacity)
    const opacity = Number.isFinite(raw)
      ? Math.min(100, Math.max(10, raw))
      : 100
    root.style.setProperty('--card-opacity', String(opacity / 100))
    if (opacity < 100) {
      root.dataset.glass = 'true'
    } else {
      delete root.dataset.glass
    }
  }, [config])
}
