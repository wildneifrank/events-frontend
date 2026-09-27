import { type KeyboardEvent, type ReactNode, useCallback, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { useClickOutside } from '@/hooks/useClickOutside'
import { cn } from '@/utils/cn'

export interface DropdownItem {
  id: string
  label: string
  icon?: ReactNode
  to?: string
  onSelect?: () => void
  danger?: boolean
  separatorBefore?: boolean
}

interface DropdownProps {
  /** Visible content of the trigger button. */
  trigger: ReactNode
  /** Accessible name of the trigger button. */
  triggerLabel: string
  triggerClassName?: string
  items: DropdownItem[]
  header?: ReactNode
  align?: 'start' | 'end'
  className?: string
}

/** Accessible menu button: arrow-key navigation, Esc to close, click-outside. */
export function Dropdown({
  trigger,
  triggerLabel,
  triggerClassName,
  items,
  header,
  align = 'end',
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerId = useId()
  const menuId = useId()

  const close = useCallback(() => setOpen(false), [])
  useClickOutside(rootRef, close, open)

  const focusItem = (index: number) => {
    const nodes = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')
    if (!nodes?.length) return
    nodes[(index + nodes.length) % nodes.length]?.focus()
  }

  const openAndFocus = (index: number) => {
    setOpen(true)
    requestAnimationFrame(() => focusItem(index))
  }

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const nodes = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    )
    const current = nodes.indexOf(document.activeElement as HTMLElement)
    const keys: Record<string, () => void> = {
      ArrowDown: () => focusItem(current + 1),
      ArrowUp: () => focusItem(current - 1),
      Home: () => focusItem(0),
      End: () => focusItem(nodes.length - 1),
      Escape: () => {
        setOpen(false)
        document.getElementById(triggerId)?.focus()
      },
      Tab: () => setOpen(false),
    }
    const handler = keys[event.key]
    if (!handler) return
    if (event.key !== 'Tab') event.preventDefault()
    handler()
  }

  const itemClass = (item: DropdownItem) =>
    cn(
      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-small font-medium outline-none transition-colors',
      '[&>svg]:size-4 [&>svg]:shrink-0',
      item.danger
        ? 'text-danger hover:bg-danger-soft focus:bg-danger-soft'
        : 'text-ink hover:bg-slate-100 focus:bg-slate-100',
    )

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        id={triggerId}
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => (open ? setOpen(false) : openAndFocus(0))}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            openAndFocus(0)
          }
        }}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          onKeyDown={onMenuKeyDown}
          className={cn(
            'animate-slide-up border-border bg-surface shadow-elevated absolute top-full z-50 mt-2 w-60 rounded-xl border p-1.5',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {header && <div className="border-border border-b px-3 pt-2 pb-3">{header}</div>}
          {items.map((item) => (
            <div key={item.id}>
              {item.separatorBefore && <div role="separator" className="bg-border my-1 h-px" />}
              {item.to ? (
                <Link
                  role="menuitem"
                  tabIndex={-1}
                  to={item.to}
                  className={itemClass(item)}
                  onClick={close}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  className={itemClass(item)}
                  onClick={() => {
                    close()
                    item.onSelect?.()
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
