import type { ReactNode } from 'react'

export interface RankedBarItem {
  id: string
  label: string
  value: number
  /** Formatted value shown at the end of the row. */
  display: string
  /** Secondary text under the label. */
  detail?: string
  icon?: ReactNode
}

/**
 * Ranked horizontal bars — a single hue encodes magnitude, identity is carried by
 * the text label (never by color), and every value is printed so no tooltip is needed.
 */
export function RankedBars({ items, caption }: { items: RankedBarItem[]; caption: string }) {
  const max = Math.max(...items.map((item) => item.value), 1)

  return (
    <figure className="flex flex-col gap-4">
      <figcaption className="sr-only">{caption}</figcaption>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                {item.icon && (
                  <span className="text-muted shrink-0 [&>svg]:size-4" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="text-small text-ink truncate font-medium">{item.label}</span>
              </span>
              <span className="text-small text-ink shrink-0 font-semibold tabular-nums">
                {item.display}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
              <div
                className="bg-primary h-full rounded-full transition-[width] duration-500"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
            {item.detail && <span className="text-caption text-muted">{item.detail}</span>}
          </li>
        ))}
      </ul>
    </figure>
  )
}
