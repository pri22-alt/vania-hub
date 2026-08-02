'use client'

import { useState, useTransition } from 'react'
import { getFinancialOverview, getExpensesByCategory, getPaymentMethodBreakdown } from '@/app/actions/analytics'
import { formatRM, getDateRanges } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Overview = Awaited<ReturnType<typeof getFinancialOverview>>
type CategoryData = Awaited<ReturnType<typeof getExpensesByCategory>>
type MethodData = Awaited<ReturnType<typeof getPaymentMethodBreakdown>>

interface AnalyticsClientProps {
  initialOverview: Overview
  initialCategoryData: CategoryData
  initialMethodData: MethodData
  initialStartDate: string
  initialEndDate: string
}

export function AnalyticsClient({
  initialOverview,
  initialCategoryData,
  initialMethodData,
  initialStartDate,
  initialEndDate,
}: AnalyticsClientProps) {
  const [overview, setOverview] = useState(initialOverview)
  const [categoryData, setCategoryData] = useState(initialCategoryData)
  const [methodData, setMethodData] = useState(initialMethodData)
  const [selectedRange, setSelectedRange] = useState('currentMonth')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [rangeLabel, setRangeLabel] = useState('Current Month')
  const [isPending, startTransition] = useTransition()

  const dateRanges = getDateRanges()

  const toDateStr = (d: Date) => d.toISOString().split('T')[0]

  const applyFilter = (start: string, end: string, label: string) => {
    setRangeLabel(label)
    startTransition(async () => {
      const [ov, cat, meth] = await Promise.all([
        getFinancialOverview(start, end),
        getExpensesByCategory(start, end),
        getPaymentMethodBreakdown(start, end),
      ])
      setOverview(ov)
      setCategoryData(cat)
      setMethodData(meth)
    })
  }

  const handleRangeClick = (key: string) => {
    setSelectedRange(key)
    setShowCustom(false)
    const range = dateRanges[key as keyof typeof dateRanges]
    if (range) applyFilter(toDateStr(range.start), toDateStr(range.end), range.label)
  }

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      setSelectedRange('custom')
      applyFilter(customStart, customEnd, `${customStart} to ${customEnd}`)
      setShowCustom(false)
    }
  }

  const net = overview.totalIncome + overview.totalSales - overview.totalExpenses

  const rangeButtons = [
    { key: 'today', label: 'Today' },
    { key: 'last7Days', label: 'Last 7 Days' },
    { key: 'last30Days', label: 'Last 30 Days' },
    { key: 'mtd', label: 'This Month (MTD)' },
    { key: 'currentMonth', label: 'Full Month' },
    { key: 'lastMonth', label: 'Last Month' },
    { key: 'ytd', label: 'Year to Date' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Date Filter */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Filter Period
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {rangeButtons.map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={selectedRange === key && !showCustom ? 'default' : 'outline'}
              onClick={() => handleRangeClick(key)}
              disabled={isPending}
              className="text-xs h-7"
            >
              {label}
            </Button>
          ))}
          <Button
            size="sm"
            variant={showCustom ? 'default' : 'outline'}
            onClick={() => { setShowCustom(!showCustom); setSelectedRange('custom') }}
            disabled={isPending}
            className="text-xs h-7"
          >
            Custom Range
          </Button>
        </div>
        {showCustom && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-36 h-8 text-xs"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-36 h-8 text-xs"
            />
            <Button size="sm" onClick={handleCustomApply} disabled={!customStart || !customEnd || isPending} className="h-8 text-xs">
              Apply
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Showing: <span className="font-medium text-foreground">{rangeLabel}</span>
          {isPending && <span className="ml-2 text-primary">Loading...</span>}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Income', value: overview.totalIncome, color: 'text-emerald-600' },
          { label: 'Total Expenses', value: overview.totalExpenses, color: 'text-rose-600' },
          { label: 'Cheese Sales', value: overview.totalSales, color: 'text-orange-600' },
          { label: 'Net Balance', value: net, color: net >= 0 ? 'text-emerald-600' : 'text-rose-600' },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{formatRM(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Expenses by Category</h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expense data for this period.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {categoryData.map((item) => {
                const pct =
                  overview.totalExpenses > 0
                    ? Math.round((Number(item.total) / overview.totalExpenses) * 100)
                    : 0
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground">{item.category}</span>
                      <span className="font-medium">{formatRM(Number(item.total))}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{pct}% of total</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Payment Methods</h3>
          {methodData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment data for this period.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {methodData.map((item) => (
                <div key={item.method} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize text-foreground">{item.method}</p>
                    <p className="text-xs text-muted-foreground">{item.count} transactions</p>
                  </div>
                  <p className="text-sm font-semibold">{formatRM(Number(item.total))}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {overview.pendingDues > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-amber-800">Total Pending Dues</p>
          <p className="text-lg font-bold text-amber-700">{formatRM(overview.pendingDues)}</p>
        </div>
      )}
    </div>
  )
}
