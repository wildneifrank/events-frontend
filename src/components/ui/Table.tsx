import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('text-small w-full border-collapse text-left', className)} {...props} />
    </div>
  )
}

export function THead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="border-border border-b bg-slate-50/70" {...props} />
}

export function TBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className="divide-border divide-y" {...props} />
}

export function TR({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('transition-colors hover:bg-slate-50/60', className)} {...props} />
}

export function TH({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        'text-caption text-muted px-4 py-3 font-semibold tracking-wide whitespace-nowrap uppercase first:pl-6 last:pr-6',
        className,
      )}
      {...props}
    />
  )
}

export function TD({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('text-ink px-4 py-3.5 align-middle first:pl-6 last:pr-6', className)}
      {...props}
    />
  )
}

export interface Column<T> {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  caption: string
  mobileCard?: (row: T) => ReactNode
  className?: string
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  caption,
  mobileCard,
  className,
}: DataTableProps<T>) {
  return (
    <div className={className}>
      <div className={cn(mobileCard && 'hidden md:block')}>
        <Table>
          <caption className="sr-only">{caption}</caption>
          <THead>
            <tr>
              {columns.map((column) => (
                <TH key={column.id} className={column.headerClassName}>
                  {column.header}
                </TH>
              ))}
            </tr>
          </THead>
          <TBody>
            {rows.map((row) => (
              <TR key={rowKey(row)}>
                {columns.map((column) => (
                  <TD key={column.id} className={column.className}>
                    {column.cell(row)}
                  </TD>
                ))}
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
      {mobileCard && (
        <ul className="divide-border divide-y md:hidden" aria-label={caption}>
          {rows.map((row) => (
            <li key={rowKey(row)} className="p-4">
              {mobileCard(row)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
