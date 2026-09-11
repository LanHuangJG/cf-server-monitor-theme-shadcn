import * as React from 'react'

import type { ApiConfig } from '@/lib/types'

// 应用主题自定义外观：
// theme_options = { "bg": "https://.../bg.jpg", "glass": false }
//   bg    —— 主题级背景图（CF-SM 后台「外观→背景图片」也会注入，二者都可）
//   glass —— 卡片是否半透明毛玻璃，默认 true
export function useAppearance(config: ApiConfig | null) {
  React.useEffect(() => {
    const root = document.documentElement
    const options = (config?.theme_options || {}) as Record<string, unknown>

    const bg = typeof options.bg === 'string' ? options.bg.trim() : ''
    if (bg) {
      root.style.setProperty('--theme-bg-image', `url("${bg}")`)
    } else {
      root.style.removeProperty('--theme-bg-image')
    }

    root.classList.toggle('no-glass', options.glass === false)
  }, [config])
}
