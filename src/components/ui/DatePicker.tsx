import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { type KeyboardEvent, useCallback, useId, useRef, useState } from 'react'

import { useClickOutside } from '@/hooks/useClickOutside'
import { cn } from '@/utils/cn'

/* Dates are handled as local "YYYY-MM-DD" strings to avoid timezone drift. */
const pad = (value: number) => String(value).padStart(2, '0')
const toKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const fromKey = (key: string) => {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}
const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
const dayLabel = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const triggerLabel = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = addDays(first, -first.getDay())
  return Array.from({ length: 42 }, (_, index) => addDays(start, index))
}

interface DatePickerProps {
  value: string | null
  onChange: (value: string | null) => void
  label?: string
  placeholder?: string
  /** Earliest selectable day, "YYYY-MM-DD" */
  min?: string
  className?: string
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Qualquer data',
  min,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState<Date>(() => (value ? fromKey(value) : new Date()))
  const rootRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const labelId = useId()
  const dialogId = useId()

  const close = useCallback(() => setOpen(false), [])
  useClickOutside(rootRef, close, open)

  const todayKey = toKey(new Date())
  const minKey = min ?? null
  const month = new Date(focused.getFullYear(), focused.getMonth(), 1)

  const focusDay = (date: Date) => {
    setFocused(date)
    requestAnimationFrame(() =>
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${toKey(date)}"]`)?.focus(),
    )
  }

  const toggle = () => {
    if (open) return setOpen(false)
    setOpen(true)
    focusDay(value ? fromKey(value) : new Date())
  }

  const select = (date: Date) => {
    onChange(toKey(date))
    setOpen(false)
    triggerRef.current?.focus()
  }

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    }
    if (event.key in moves) {
      event.preventDefault()
      focusDay(addDays(focused, moves[event.key] ?? 0))
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <div ref={rootRef} className={cn('relative flex flex-col gap-1.5', className)}>
      {label && (
        <span id={labelId} className="text-small text-ink font-medium">
          {label}
        </span>
      )}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={toggle}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={dialogId}
          aria-labelledby={label ? `${labelId} ${dialogId}-value` : undefined}
          className={cn(
            'focus-ring border-border bg-surface text-body flex h-11 w-full items-center gap-2.5 rounded-xl border pr-9 pl-3.5 text-left transition-colors hover:border-slate-300',
            open && 'border-primary ring-primary/15 ring-4',
          )}
        >
          <CalendarDays className="text-muted size-[18px] shrink-0" aria-hidden="true" />
          <span id={`${dialogId}-value`} className={cn('truncate', !value && 'text-slate-400')}>
            {value ? triggerLabel.format(fromKey(value)).replace('.', '') : placeholder}
          </span>
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Limpar data"
            className="focus-ring text-muted hover:text-ink absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 hover:bg-slate-100"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <div
          id={dialogId}
          role="dialog"
          aria-modal="false"
          aria-label="Escolher data"
          className="animate-slide-up border-border bg-surface shadow-elevated absolute top-full left-0 z-40 mt-2 w-[18.5rem] rounded-2xl border p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => focusDay(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              aria-label="Mês anterior"
              className="focus-ring text-muted hover:text-ink rounded-lg p-2 hover:bg-slate-100"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <p
              className="text-small text-ink font-semibold first-letter:uppercase"
              aria-live="polite"
            >
              {monthLabel.format(month)}
            </p>
            <button
              type="button"
              onClick={() => focusDay(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              aria-label="Próximo mês"
              className="focus-ring text-muted hover:text-ink rounded-lg p-2 hover:bg-slate-100"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="text-caption text-muted grid grid-cols-7 text-center" aria-hidden="true">
            {WEEKDAYS.map((day, index) => (
              <span key={index} className="py-1">
                {day}
              </span>
            ))}
          </div>

          <div
            ref={gridRef}
            role="grid"
            onKeyDown={onGridKeyDown}
            className="grid grid-cols-7 gap-0.5"
          >
            {monthGrid(month).map((date) => {
              const key = toKey(date)
              const outside = date.getMonth() !== month.getMonth()
              const disabled = minKey !== null && key < minKey
              const selected = key === value
              const isFocused = key === toKey(focused)
              return (
                <button
                  key={key}
                  type="button"
                  data-day={key}
                  tabIndex={isFocused ? 0 : -1}
                  disabled={disabled}
                  aria-pressed={selected}
                  aria-label={dayLabel.format(date)}
                  onClick={() => select(date)}
                  className={cn(
                    'focus-ring text-small flex h-9 items-center justify-center rounded-lg tabular-nums transition-colors',
                    selected ? 'bg-primary font-semibold text-white' : 'hover:bg-primary-50',
                    !selected && outside && 'text-slate-300',
                    !selected && key === todayKey && 'text-primary font-bold',
                    disabled && 'pointer-events-none opacity-30',
                  )}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          <div className="border-border mt-2 flex justify-between border-t pt-2">
            <button
              type="button"
              className="focus-ring text-small text-primary hover:bg-primary-50 rounded-md px-2 py-1 font-semibold"
              onClick={() => select(new Date())}
            >
              Hoje
            </button>
            <button
              type="button"
              className="focus-ring text-small text-muted rounded-md px-2 py-1 font-medium hover:bg-slate-100"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
