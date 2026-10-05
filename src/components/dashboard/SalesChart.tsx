import { useId, useState } from 'react'

import type { DailySales } from '@/types'
import { cn } from '@/utils/cn'
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatNumber,
  formatWeekday,
} from '@/utils/format'

type Metric = 'revenue' | 'tickets'

const METRICS: Record<
  Metric,
  { label: string; format: (value: number) => string; axis: (value: number) => string }
> = {
  revenue: { label: 'Receita', format: formatCurrency, axis: formatCompactCurrency },
  tickets: { label: 'Ingressos', format: formatNumber, axis: formatNumber },
}

function niceMax(value: number): number {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
  const step = steps.find((candidate) => candidate * magnitude >= value) ?? 10
  return step * magnitude
}

export function SalesChart({ data }: { data: DailySales[] }) {
  const [metric, setMetric] = useState<Metric>('revenue')
  const [active, setActive] = useState<number | null>(null)
  const tableId = useId()
  const config = METRICS[metric]
  const max = niceMax(Math.max(...data.map((day) => day[metric])))
  const gridLines = [1, 0.5, 0]

  return (
    <div className="flex flex-col gap-4">
      <div
        role="radiogroup"
        aria-label="Métrica do gráfico"
        className="inline-flex w-fit gap-1 rounded-lg bg-slate-100 p-1"
      >
        {(Object.keys(METRICS) as Metric[]).map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={metric === key}
            onClick={() => setMetric(key)}
            className={cn(
              'focus-ring text-small h-8 rounded-md px-3 font-semibold transition-colors',
              metric === key ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
            )}
          >
            {METRICS[key].label}
          </button>
        ))}
      </div>

      <div className="relative flex h-64 gap-3" aria-describedby={tableId}>
        <div
          className="text-caption text-muted flex w-14 shrink-0 flex-col justify-between pb-7 text-right tabular-nums"
          aria-hidden="true"
        >
          {gridLines.map((ratio) => (
            <span key={ratio} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
              {config.axis(max * ratio)}
            </span>
          ))}
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 bottom-7 flex flex-col justify-between"
            aria-hidden="true"
          >
            {gridLines.map((ratio) => (
              <span
                key={ratio}
                className={cn('h-px', ratio === 0 ? 'bg-slate-300' : 'bg-slate-100')}
              />
            ))}
          </div>

          <ul
            className="relative flex flex-1 items-end gap-[2px]"
            onMouseLeave={() => setActive(null)}
          >
            {data.map((day, index) => {
              const value = day[metric]
              const isActive = active === index
              return (
                <li key={day.date} className="relative flex h-full flex-1 items-end justify-center">
                  <button
                    type="button"
                    aria-label={`${formatDate(day.date)}: ${config.format(value)}`}
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onBlur={() => setActive(null)}
                    className="group focus-ring flex h-full w-full items-end justify-center rounded-md"
                  >
                    <span
                      className={cn(
                        'w-full max-w-10 rounded-t-[4px] transition-[height,background-color] duration-300',
                        isActive ? 'bg-primary-dark' : 'bg-primary',
                        active !== null && !isActive && 'bg-primary/45',
                      )}
                      style={{ height: `${Math.max((value / max) * 100, 1)}%` }}
                    />
                  </button>
                  {isActive && (
                    <div
                      role="tooltip"
                      className={cn(
                        'bg-night shadow-elevated pointer-events-none absolute bottom-full z-10 mb-2 w-max rounded-lg px-3 py-2 text-white',
                        index > data.length - 3
                          ? 'right-0'
                          : index < 2
                            ? 'left-0'
                            : 'left-1/2 -translate-x-1/2',
                      )}
                    >
                      <p className="text-caption text-white/70">{formatDate(day.date)}</p>
                      <p className="text-small font-semibold">{formatCurrency(day.revenue)}</p>
                      <p className="text-caption text-white/70">
                        {formatNumber(day.tickets)} ingressos
                      </p>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="text-caption text-muted flex h-7 items-end gap-[2px]" aria-hidden="true">
            {data.map((day) => (
              <span key={day.date} className="flex-1 text-center">
                {formatWeekday(day.date)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <table id={tableId} className="sr-only">
        <caption>Vendas nos últimos 7 dias</caption>
        <thead>
          <tr>
            <th scope="col">Dia</th>
            <th scope="col">Receita</th>
            <th scope="col">Ingressos</th>
          </tr>
        </thead>
        <tbody>
          {data.map((day) => (
            <tr key={day.date}>
              <td>{formatDate(day.date)}</td>
              <td>{formatCurrency(day.revenue)}</td>
              <td>{formatNumber(day.tickets)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
