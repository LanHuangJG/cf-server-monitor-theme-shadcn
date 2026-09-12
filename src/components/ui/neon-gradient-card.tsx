import * as React from 'react'

import { cn } from '@/lib/utils'

// Magic UI Neon Gradient Card（零依赖，CSS 伪元素渐变边框）
export function NeonGradientCard({
  className,
  children,
  borderSize = 2,
  borderRadius = 12,
  neonColors = { firstColor: '#ff00aa', secondColor: '#00FFF1' },
  ...props
}: React.ComponentProps<'div'> & {
  borderSize?: number
  borderRadius?: number
  neonColors?: { firstColor: string; secondColor: string }
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [size, setSize] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [children])

  return (
    <div
      ref={containerRef}
      style={
        {
          '--border-size': `${borderSize}px`,
          '--border-radius': `${borderRadius}px`,
          '--neon-first-color': neonColors.firstColor,
          '--neon-second-color': neonColors.secondColor,
          '--pseudo-element-width': `${size.width + borderSize * 2}px`,
          '--pseudo-element-height': `${size.height + borderSize * 2}px`,
          '--after-blur': `${size.width / 3}px`,
          '--card-content-radius': `${borderRadius - borderSize}px`,
        } as React.CSSProperties
      }
      className={cn(
        'relative isolate size-full rounded-(--border-radius)',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative size-full min-h-[inherit] rounded-(--card-content-radius) bg-card text-card-foreground',
          'before:absolute before:-top-(--border-size) before:-left-(--border-size) before:-z-10 before:block before:h-(--pseudo-element-height) before:w-(--pseudo-element-width) before:rounded-(--border-radius) before:content-[""]',
          'before:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))] before:bg-size-[100%_200%] before:animate-background-position-spin',
          'after:absolute after:-top-(--border-size) after:-left-(--border-size) after:-z-10 after:block after:h-(--pseudo-element-height) after:w-(--pseudo-element-width) after:rounded-(--border-radius) after:content-[""] after:blur-(--after-blur) after:opacity-60',
          'after:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))] after:bg-size-[100%_200%] after:animate-background-position-spin'
        )}
      >
        {children}
      </div>
    </div>
  )
}
