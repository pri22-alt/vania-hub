'use client'

import { Card } from '@/components/ui/card'
import { formatRM } from '@/lib/utils/currency'

export function BudgetSummary({ budgets }: any) {
  if (!budgets || budgets.length === 0) return null

  const totalBudget = budgets.reduce((sum: number, b: any) => sum + Number(b.budgetAmount), 0)
  const totalSpent = budgets.reduce((sum: number, b: any) => sum + (b.status?.spentAmount || 0), 0)
  const totalRemaining = totalBudget - totalSpent
  const overBudgetCount = budgets.filter((b: any) => b.status?.isOverBudget).length
  const warningCount = budgets.filter((b: any) => b.status?.shouldAlert && !b.status?.isOverBudget).length
  const onTrackCount = budgets.filter((b: any) => !b.status?.isOverBudget && !b.status?.shouldAlert).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      {/* Total Budget */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Total Budget</p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatRM(totalBudget)}</p>
      </Card>

      {/* Total Spent */}
      <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
        <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Spent</p>
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatRM(totalSpent)}</p>
      </Card>

      {/* Remaining */}
      <Card className={`p-4 bg-gradient-to-br ${totalRemaining >= 0 ? 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800' : 'from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 border-rose-200 dark:border-rose-800'}`}>
        <p className={`text-xs font-medium ${totalRemaining >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>Remaining</p>
        <p className={`text-2xl font-bold mt-1 ${totalRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {formatRM(Math.abs(totalRemaining))}
        </p>
      </Card>

      {/* On Track */}
      <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
        <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">On Track</p>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{onTrackCount}</p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">budget{onTrackCount !== 1 ? 's' : ''}</p>
      </Card>

      {/* Warnings */}
      <Card className="p-4 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 border-rose-200 dark:border-rose-800">
        <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">Alerts</p>
        <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{overBudgetCount + warningCount}</p>
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">need attention</p>
      </Card>
    </div>
  )
}
