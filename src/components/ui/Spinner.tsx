import { cn } from '@/utils/cn'

const SIZES = { sm: 'size-4 border-2', md: 'size-6 border-2', lg: 'size-10 border-[3px]' }

interface SpinnerProps {
  size?: keyof typeof SIZES
  className?: string
  label?: string
}

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        'text-primary inline-block animate-spin rounded-full border-current border-r-transparent',
        SIZES[size],
        className,
      )}
    />
  )
}

export function PageSpinner({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" label={label} />
    </div>
  )
}
