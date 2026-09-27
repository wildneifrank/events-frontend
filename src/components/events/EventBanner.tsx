import { ImageWithFallback } from '@/components/ui'
import { getCategory } from '@/constants/categories'
import type { EventCategory } from '@/types'
import { cn } from '@/utils/cn'

interface EventBannerProps {
  src: string
  category: EventCategory
  alt?: string
  className?: string
  /** Width hint passed to the image CDN. */
  width?: number
}

function withWidth(src: string, width?: number) {
  if (!width || !src.includes('images.unsplash.com')) return src
  const url = new URL(src)
  url.searchParams.set('w', String(width))
  return url.toString()
}

/** Event image with a branded, category-tinted fallback when the image is missing or fails. */
export function EventBanner({ src, category, alt = '', className, width }: EventBannerProps) {
  const meta = getCategory(category)
  const Icon = meta.icon
  const fallback = (
    <div
      className={cn('flex size-full items-center justify-center', className)}
      style={{ background: `linear-gradient(135deg, ${meta.tint} 0%, #0F172A 130%)` }}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
    >
      <Icon className="size-1/4 max-h-16 max-w-16 text-white/35" aria-hidden="true" />
    </div>
  )

  return (
    <div className={cn('relative overflow-hidden bg-slate-200', className)}>
      <ImageWithFallback
        src={withWidth(src, width)}
        alt={alt}
        fallback={fallback}
        className="size-full object-cover"
      />
    </div>
  )
}
