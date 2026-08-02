'use client'

import { useState, useTransition } from 'react'
import { getFinancialOverview } from '@/app/actions/analytics'
import { getDues } from '@/app/actions/dues'
import { formatRM } from '@/lib/utils/currency'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const navCards = [
  { href: '/expenses', label: 'Expenses', desc: 'Track daily spending', color: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
  { href: '/income', label: 'Income', desc: 'Record earnings', color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  { href: '/dues', label: 'Dues & Bills', desc: 'Manage payments', color: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  { href: '/maid', label: 'Maid Attendance', desc: 'Clock in / out', color: 'bg-sky-50 border-sky-200', text: 'text-sky-700' },
  { href: '/virmanis', label: 'Virmanis United', desc: 'Business revenue', color: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
  { href: '/analytics', label: 'Analytics', desc: 'Reports & insights', color: 'bg-violet-50 border-violet-200', text: 'text-violet-700' },
]

export function DashboardClient({ initialOverview, initialDues }: any) {
  const [overview, setOverview] = useState(initialOverview)
  const [allDues, setAllDues] = useState(initialDues)
  const [isPending, startTransition] = useTransition()
  
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'ytd' | 'custom'>('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const pending = allDues.filter((d: any) => d.status === 'pending')
  const net = overview.totalIncome + overview.totalSales - overview.totalExpenses

  const getDateRange = () => {
    const today = new Date()
    const start = new Date()
    const end = new Date()

    switch (dateRange) {
      case 'today':
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'week':
        start.setDate(today.getDate() - 7)
        break
      case 'month':
        start.setDate(1)
        end.setMonth(end.getMonth() + 1)
        end.setDate(0)
        break
      case 'ytd':
        start.setMonth(0, 1)
        break
      case 'custom':
        if (customStart) start.setTime(new Date(customStart).getTime())
        if (customEnd) end.setTime(new Date(customEnd).getTime())
        break
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    }
  }

  const handleFilter = (filter: string) => {
    setDateRange(filter as any)
    startTransition(async () => {
      const range = getDateRange()
      const [newOverview, newDues] = await Promise.all([
        getFinancialOverview(range.start, range.end),
        getDues(),
      ])
      setOverview(newOverview)
      setAllDues(newDues)
    })
  }

  return (
    <div className="w-full min-h-screen bg-background pb-24 md:pb-8">
      {/* Header with Filters */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-40">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1 text-xs md:text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'Last 7 Days' },
              { key: 'month', label: 'This Month' },
              { key: 'ytd', label: 'Year to Date' },
            ].map(f => (
              <Button
                key={f.key}
                variant={dateRange === f.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilter(f.key)}
                disabled={isPending}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="flex gap-2 mt-3">
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-9 w-40"
                placeholder="Start date"
              />
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-9 w-40"
                placeholder="End date"
              />
              <Button
                size="sm"
                onClick={() => handleFilter('custom')}
                disabled={isPending || !customStart || !customEnd}
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        {isPending && <div className="mb-4 text-sm text-muted-foreground">Loading...</div>}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border border-emerald-200 dark:border-emerald-800 rounded-lg md:rounded-xl p-3 md:p-4">
            <p className="text-xs md:text-sm text-emerald-700 dark:text-emerald-300 font-medium">Income</p>
            <p className="text-base md:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatRM(overview.totalIncome)}</p>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 border border-rose-200 dark:border-rose-800 rounded-lg md:rounded-xl p-3 md:p-4">
            <p className="text-xs md:text-sm text-rose-700 dark:text-rose-300 font-medium">Expenses</p>
            <p className="text-base md:text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">{formatRM(overview.totalExpenses)}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border border-orange-200 dark:border-orange-800 rounded-lg md:rounded-xl p-3 md:p-4">
            <p className="text-xs md:text-sm text-orange-700 dark:text-orange-300 font-medium">Cheese Sales</p>
            <p className="text-base md:text-lg font-bold text-orange-600 dark:text-orange-400 mt-1">{formatRM(overview.totalSales)}</p>
          </div>
          <div className={`bg-gradient-to-br ${net >= 0 ? 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800' : 'from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800'} border rounded-lg md:rounded-xl p-3 md:p-4`}>
            <p className={`text-xs md:text-sm font-medium ${net >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'}`}>Net Balance</p>
            <p className={`text-base md:text-lg font-bold mt-1 ${net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>{formatRM(net)}</p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
          {navCards.map((card) => (
            <Link key={card.href} href={card.href}
              className={`rounded-lg md:rounded-xl border p-3 md:p-4 ${card.color} hover:shadow-md transition-all hover:-translate-y-1 active:translate-y-0`}>
              <p className={`font-semibold text-xs md:text-sm ${card.text}`}>{card.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </Link>
          ))}
        </div>

        {/* Pending Dues Alert */}
        {pending.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg md:rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm md:text-base">{pending.length} Pending Due{pending.length > 1 ? 's' : ''}</p>
              <Link href="/dues" className="text-xs md:text-sm text-amber-600 dark:text-amber-400 hover:underline font-medium">View all</Link>
            </div>
            <div className="flex flex-col gap-2 md:gap-3">
              {pending.slice(0, 4).map((due: any) => (
                <div key={due.id} className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-amber-900 dark:text-amber-100">{due.description}</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-300">{formatRM(due.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
