'use client'
import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Nick', value: 'Nick' },
  { label: 'Erin', value: 'Erin' },
]

export default function QueueFilters(): React.JSX.Element {
  const searchParams = useSearchParams()
  const current = searchParams.get('assignee') ?? ''

  return (
    <div className="flex gap-2 mb-6">
      {FILTERS.map(({ label, value }) => {
        const href = value ? `/views/queue?assignee=${value}` : '/views/queue'
        const active = current === value
        return (
          <Link
            key={label}
            href={href}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              active
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
