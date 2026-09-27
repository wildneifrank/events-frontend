import { memo } from 'react'

import { cn } from '@/utils/cn'

const SIZE = 29

function hash(text: string): number {
  let value = 2166136261
  for (let index = 0; index < text.length; index++) {
    value ^= text.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}

function isFinderArea(x: number, y: number): boolean {
  const inBox = (bx: number, by: number) => x >= bx && x < bx + 8 && y >= by && y < by + 8
  return inBox(0, 0) || inBox(SIZE - 8, 0) || inBox(0, SIZE - 8)
}

/**
 * Deterministic, visually QR-like matrix for mock tickets.
 * Not a scannable code — the backend worker will generate the real one.
 */
function buildModules(value: string): [number, number][] {
  let seed = hash(value)
  const next = () => {
    seed ^= seed << 13
    seed ^= seed >>> 17
    seed ^= seed << 5
    return (seed >>> 0) / 4_294_967_296
  }
  const modules: [number, number][] = []
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (!isFinderArea(x, y) && next() > 0.52) modules.push([x, y])
    }
  }
  return modules
}

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={7} height={7} rx={1.2} className="fill-ink" />
      <rect x={x + 1} y={y + 1} width={5} height={5} rx={0.8} className="fill-white" />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.6} className="fill-ink" />
    </g>
  )
}

interface QrCodeProps {
  value: string
  className?: string
  label?: string
}

export const QrCode = memo(function QrCode({ value, className, label }: QrCodeProps) {
  const modules = buildModules(value)
  return (
    <svg
      viewBox={`-2 -2 ${SIZE + 4} ${SIZE + 4}`}
      role="img"
      aria-label={label ?? `QR code do ingresso ${value}`}
      className={cn('rounded-xl bg-white', className)}
      shapeRendering="crispEdges"
    >
      {modules.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} className="fill-ink" />
      ))}
      <Finder x={0} y={0} />
      <Finder x={SIZE - 7} y={0} />
      <Finder x={0} y={SIZE - 7} />
    </svg>
  )
})
