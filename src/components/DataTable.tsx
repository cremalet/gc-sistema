'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

export type Column<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
  headerClassName?: string
}

type DataTableProps<T> = {
  data: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  rowHref?: (row: T) => string
  emptyState?: ReactNode
}

export default function DataTable<T>({
  data,
  columns,
  rowKey,
  rowHref,
  emptyState,
}: DataTableProps<T>) {
  const router = useRouter()

  if (data.length === 0) {
    return emptyState ? <>{emptyState}</> : null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-medium text-gray-700 ${col.headerClassName ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => {
              const href = rowHref?.(row)
              return (
                <tr
                  key={rowKey(row)}
                  onClick={href ? () => router.push(href) : undefined}
                  className={
                    href
                      ? 'cursor-pointer hover:bg-gray-50 transition-colors'
                      : ''
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-gray-900 ${col.className ?? ''}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
