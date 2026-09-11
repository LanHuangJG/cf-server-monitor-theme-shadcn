import { CircleDashed, LayoutGrid, Table2 } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type ViewMode = 'grid' | 'table' | 'ring'

const VIEWS: { value: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { value: 'grid', label: '卡片', icon: LayoutGrid },
  { value: 'table', label: '表格', icon: Table2 },
  { value: 'ring', label: '环形', icon: CircleDashed },
]

export function ViewSwitcher({
  value,
  onChange,
}: {
  value: ViewMode
  onChange: (value: ViewMode) => void
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ViewMode)}>
      <TabsList>
        {VIEWS.map((v) => (
          <TabsTrigger
            key={v.value}
            value={v.value}
            title={v.label}
            aria-label={v.label}
            className="flex-none px-2"
          >
            <v.icon className="size-4" />
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
