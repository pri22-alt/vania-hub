'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatRM } from '@/lib/utils/currency'
import { deleteBudget } from '@/app/actions/budgets'
import { useState } from 'react'

export function BudgetList({ budgets }: any) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this budget?')) return
    setDeletingId(id)
    try {
      await deleteBudget(id)
    } finally {
      setDeletingId(null)
    }
  }

  const getProgressColor = (percentUsed: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'bg-destructive'
    if (percentUsed >= 80) return 'bg-amber-500'
    if (percentUsed >= 50) return 'bg-blue-500'
    return 'bg-emerald-500'
  }

  const getStatusLabel = (percentUsed: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'Over Budget'
    if (percentUsed >= 80) return 'Warning: Near Limit'
    if (percentUsed >= 50) return 'On Track'
    return 'Safe'
  }

  const getStatusColor = (percentUsed: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'text-destructive'
    if (percentUsed >= 80) return 'text-amber-600'
    if (percentUsed >= 50) return 'text-blue-600'
    return 'text-emerald-600'
  }

  if (!budgets || budgets.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">No budgets yet</p>
          <p className="text-sm text-muted-foreground">Create a budget to start tracking your spending</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {budgets.map((budget: any) => {
        const status = budget.status
        if (!status) return null

        const percentUsed = Math.min(Math.round(status.percentUsed), 100)
        const statusLabel = getStatusLabel(status.percentUsed, status.isOverBudget)
        const statusColor = getStatusColor(status.percentUsed, status.isOverBudget)
        const progressColor = getProgressColor(status.percentUsed, status.isOverBudget)

        return (
          <Card key={budget.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{budget.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {budget.categoryType === 'business' ? '💼' : '🏠'} {budget.category}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(budget.id)}
                disabled={deletingId === budget.id}
                className="text-destructive hover:bg-destructive/10"
              >
                Delete
              </Button>
            </div>

            {/* Spending Summary */}
            <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Budget</p>
                <p className="font-semibold">{formatRM(status.budgetAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Spent</p>
                <p className="font-semibold">{formatRM(status.spentAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Remaining</p>
                <p className={`font-semibold ${status.remaining >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                  {formatRM(Math.abs(status.remaining))}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">{percentUsed}% Used</span>
                <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${progressColor}`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
            </div>

            {/* Alert Message */}
            {status.shouldAlert && (
              <div className={`text-sm p-2 rounded ${status.isOverBudget ? 'bg-destructive/10 text-destructive' : 'bg-amber-50 text-amber-700'}`}>
                {status.isOverBudget 
                  ? `⚠️ Over budget by ${formatRM(Math.abs(status.remaining))}`
                  : `⚠️ Approaching budget limit (${(budget.alertThreshold || 80)}%)`
                }
              </div>
            )}

            {budget.notes && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">{budget.notes}</p>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
