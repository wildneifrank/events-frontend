import { cn } from '@/utils/cn'
import { dateBadgeParts } from '@/utils/format'

export function EventDateBadge({ date, className }: { date: string; className?: string }) {
  const { day, month } = dateBadgeParts(date)
  return (
    <div
      className={cn(
        'bg-surface/95 flex w-12 flex-col items-center rounded-xl py-1.5 leading-none shadow-sm backdrop-blur',
        className,
      )}
    >
      <span className="text-caption text-primary font-bold tracking-wider">{month}</span>
      <span className="text-ink mt-0.5 text-xl font-extrabold tabular-nums">{day}</span>
    </div>
  )
}
