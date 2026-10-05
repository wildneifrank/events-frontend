import { type HTMLAttributes, type KeyboardEvent, useRef } from 'react'

import { cn } from '@/utils/cn'

export interface TabItem<T extends string> {
  value: T
  label: string
  count?: number
}

interface TabsProps<T extends string> {
  id: string
  items: readonly TabItem<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}

const tabIds = (id: string, value: string) => ({
  tab: `${id}-tab-${value}`,
  panel: `${id}-panel-${value}`,
})

export function Tabs<T extends string>({
  id,
  items,
  value,
  onChange,
  label,
  className,
}: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((item) => item.value === value)
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: items.length - 1,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    const next = items[(target + items.length) % items.length]
    if (!next) return
    onChange(next.value)
    listRef.current
      ?.querySelector<HTMLElement>(`#${CSS.escape(tabIds(id, next.value).tab)}`)
      ?.focus()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('inline-flex gap-1 rounded-xl bg-slate-100 p-1', className)}
    >
      {items.map((item) => {
        const selected = item.value === value
        const ids = tabIds(id, item.value)
        return (
          <button
            key={item.value}
            id={ids.tab}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={ids.panel}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              'focus-ring text-small inline-flex h-9 items-center gap-2 rounded-lg px-4 font-semibold transition-colors',
              selected ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs',
                  selected ? 'bg-primary-50 text-primary-dark' : 'bg-slate-200 text-slate-600',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  tabsId: string
  value: string
}

export function TabPanel({ tabsId, value, className, ...props }: TabPanelProps) {
  const ids = tabIds(tabsId, value)
  return (
    <div
      id={ids.panel}
      role="tabpanel"
      aria-labelledby={ids.tab}
      tabIndex={0}
      className={cn('focus-ring rounded-xl', className)}
      {...props}
    />
  )
}
