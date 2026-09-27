import { type ImgHTMLAttributes, type ReactNode, useState } from 'react'

import { cn } from '@/utils/cn'

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback: ReactNode
}

/** Lazy image that fades in and swaps to a designed fallback when it fails to load. */
export function ImageWithFallback({
  src,
  fallback,
  className,
  alt = '',
  ...props
}: ImageWithFallbackProps) {
  const [state, setState] = useState<{ src?: string; status: 'loading' | 'loaded' | 'error' }>({
    src,
    status: 'loading',
  })
  // Reset when the source changes (derived state, no effect needed).
  const status = state.src === src ? state.status : 'loading'
  if (state.src !== src) setState({ src, status: 'loading' })

  if (!src || status === 'error') return <>{fallback}</>

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setState({ src, status: 'loaded' })}
      onError={() => setState({ src, status: 'error' })}
      className={cn(
        'transition-opacity duration-500',
        status === 'loaded' ? 'opacity-100' : 'opacity-0',
        className,
      )}
      {...props}
    />
  )
}
