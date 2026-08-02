'use client'

import { useState, useTransition } from 'react'
import { getSalesStats, getSalesByCustomer, getSalesByProduct, getVirmanisSales } from '@/app/actions/virmanis'
import { getExpenses } from '@/app/actions/expenses'
import { formatRM, getDateRanges } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VirmanisList, type VirmanisSale } from '@/components/virmanis-list'

type Stats = Awaited<ReturnType<typeof getSalesStats>>
type CustomerSales = Awaited<ReturnType<typeof getSalesByCustomer>>
type ProductSales = Awaited<ReturnType<typeof getSalesByProduct>>
type Expenses = Awaited<ReturnType<typeof getExpenses>>

interface VirmanisAnalyticsProps {
  initialStats: Stats
  initialCustomerSales: CustomerSales
  initialProductSales: ProductSales
  initialSales: VirmanisSale[]
  initialExpenses: Expenses
  initialStartDate: string
  initialEndDate: string
}

export function VirmanisAnalytics({
  initialStats,
  initialCustomerSales,
  initialProductSales,
  initialSales,
  initialExpenses,
  initialStartDate,
  initialEndDate,
}: VirmanisAnalyticsProps) {
  const [stats, setStats] = useState(initialStats)
  const [customerSales, setCustomerSales] = useState(initialCustomerSales)
  const [productSales, setProductSales] = useState(initialProductSales)
  const [sales, setSales] = useState(initialSales)
  const [expenses, setExpenses] = useState(initialExpenses)
  const [selectedRange, setSelectedRange] = useState('currentMonth')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [rangeLabel, setRangeLabel] = useState('Full Month')
  const [isPending, startTransition] = useTransition()

  const dateRanges = getDateRanges()
  const toDateStr = (d: Date) => d.toISOString().split('T')[0]

  const applyFilter = (start: string, end: string, label: string) => {
    setRangeLabel(label)
    startTransition(async () => {
      const [newStats, newCustomers, newProducts, newSales, newExpenses] = await Promise.all([
        getSalesStats(start, end),
        getSalesByCustomer(start, end),
        getSalesByProduct(start, end),
        getVirmanisSales(start, end),
        getExpenses(start, end),
      ])
      setStats(newStats)
      setCustomerSales(newCustomers)
      setProductSales(newProducts)
      setSales(newSales as VirmanisSale[])
      setExpenses(newExpenses)
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

  const currentStats = stats[0] || {}
  const totalSales = Number(currentStats.totalSales || 0)
  const txCount = Number(currentStats.transactionCount || 0)
  const businessExpenses = expenses.filter((e) => e.categoryType === 'business')
  const totalBusinessExpenses = businessExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const netProfit = totalSales - totalBusinessExpenses

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
            <Button
              size="sm"
              onClick={handleCustomApply}
              disabled={!customStart || !customEnd || isPending}
              className="h-8 text-xs"
            >
              Apply
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Showing: <span className="font-medium text-foreground">{rangeLabel}</span>
          {isPending && <span className="ml-2 text-primary">Loading...</span>}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Sales</p>
          <p className="text-xl font-bold text-emerald-600">{formatRM(totalSales)}</p>
          <p className="text-xs text-muted-foreground mt-1">{txCount} transactions</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Business Expenses</p>
          <p className="text-xl font-bold text-rose-600">{formatRM(totalBusinessExpenses)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
          <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatRM(netProfit)}
          </p>
          {totalSales > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {((netProfit / totalSales) * 100).toFixed(1)}% margin
            </p>
          )}
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Avg. Transaction</p>
          <p className="text-xl font-bold text-blue-600">
            {formatRM(txCount > 0 ? totalSales / txCount : 0)}
          </p>
        </div>
      </div>

      {/* Top Customers & Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h4 className="font-semibold text-foreground mb-4">Top Customers</h4>
          {customerSales.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales in this period.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {customerSales.slice(0, 8).map((cs, i) => {
                const pct = totalSales > 0 ? Math.round((Number(cs.total) / totalSales) * 100) : 0
                return (
                  <div key={cs.customerName}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground truncate mr-2">{cs.customerName}</span>
                      <span className="font-medium shrink-0">
                        {formatRM(Number(cs.total))}
                        <span className="text-xs text-muted-foreground ml-1">({cs.count} orders)</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h4 className="font-semibold text-foreground mb-4">Sales by Product</h4>
          {productSales.length === 0 ? (
            <p className="text-sm text-muted-foreground">No product data in this period.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {productSales.map((ps) => {
                const pct = totalSales > 0 ? Math.round((Number(ps.total) / totalSales) * 100) : 0
                return (
                  <div key={ps.productName}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-foreground truncate mr-2">{ps.productName}</span>
                      <span className="font-medium shrink-0">
                        {formatRM(Number(ps.total))}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({Number(ps.quantity).toFixed(1)} kg)
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Business Expenses */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h4 className="font-semibold text-foreground mb-4">Business Spending</h4>
        {businessExpenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No business expenses in this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Date</th>
                  <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Description</th>
                  <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Category</th>
                  <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {businessExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">
                      {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-2 px-2">{expense.description}</td>
                    <td className="py-2 px-2 text-muted-foreground">{expense.category}</td>
                    <td className="py-2 px-2 text-right font-semibold text-rose-600">
                      {formatRM(Number(expense.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sales Records */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h4 className="font-semibold text-foreground mb-4">Sales Records</h4>
        <VirmanisList sales={sales} />
      </div>
    </div>
  )
}
