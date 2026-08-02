'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getDateRanges } from '@/lib/utils/currency'

interface DateFilterProps {
  onFilter: (startDate: Date, endDate: Date) => void
  onRangeChange?: (rangeLabel: string) => void
}

export function DateFilter({ onFilter, onRangeChange }: DateFilterProps) {
  const dateRanges = getDateRanges()
  const [selectedRange, setSelectedRange] = useState<string>('mtd')
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const handleRangeClick = (rangeKey: string) => {
    setSelectedRange(rangeKey)
    setShowCustom(false)
    const range = dateRanges[rangeKey as keyof typeof dateRanges]
    if (range) {
      onFilter(range.start, range.end)
      onRangeChange?.(range.label)
    }
  }

  const handleCustomFilter = () => {
    if (customStart && customEnd) {
      const startDate = new Date(customStart)
      const endDate = new Date(customEnd)
      endDate.setHours(23, 59, 59)
      onFilter(startDate, endDate)
      onRangeChange?.(`${customStart} to ${customEnd}`)
      setShowCustom(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Filter by date range:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'today', label: 'Today' },
              { key: 'last7Days', label: 'Last 7 Days' },
              { key: 'last30Days', label: 'Last 30 Days' },
              { key: 'mtd', label: 'MTD' },
              { key: 'ytd', label: 'YTD' },
              { key: 'currentMonth', label: 'Current Month' },
              { key: 'lastMonth', label: 'Last Month' },
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={selectedRange === key && !showCustom ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRangeClick(key)}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Button
            variant={showCustom ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowCustom(!showCustom)}
            className="text-xs"
          >
            Custom Range
          </Button>
        </div>

        {showCustom && (
          <div className="flex flex-col sm:flex-row gap-3 bg-muted p-3 rounded-md">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="text-sm border border-input rounded px-2 py-1"
              placeholder="Start date"
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="text-sm border border-input rounded px-2 py-1"
              placeholder="End date"
            />
            <Button
              size="sm"
              onClick={handleCustomFilter}
              disabled={!customStart || !customEnd}
              className="text-xs"
            >
              Apply
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
