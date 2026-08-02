'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatRM } from '@/lib/utils/currency'
import { updateBudgetAdjustment } from '@/app/actions/budgets'
import { getBudgetAdjustment } from '@/lib/utils/budget-utils'

export function BudgetList({ budgets }: any) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [adjustments, setAdjustments] = useState<{ [key: number]: { carryForward: string; extraFunds: string } }>({})

  const handleAdjustmentChange = (budgetId: number, field: 'carryForward' | 'extraFunds', value: string) => {
    setAdjustments({
      ...adjustments,
      [budgetId]: {
        ...adjustments[budgetId],
        [field]: value,
      },
    })
  }

  const handleSaveAdjustment = async (budgetId: number) => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const adj = adjustments[budgetId] || { carryForward: '0', extraFunds: '0' }
    await updateBudgetAdjustment(
      budgetId,
      currentMonth,
      parseFloat(adj.carryForward) || 0,
      parseFloat(adj.extraFunds) || 0,
    )
    setExpandedId(null)
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
        const percentUsed = budget.percentage || 0
        const statusLabel = getStatusLabel(percentUsed, budget.isOverBudget)
        const statusColor = getStatusColor(percentUsed, budget.isOverBudget)
        const progressColor = getProgressColor(percentUsed, budget.isOverBudget)
        const adjustedBudgetAmount = budget.adjustedBudget || Number(budget.budgetAmount)
        const adj = adjustments[budget.id] || budget.adjustments || { carryForward: 0, extraFunds: 0 }
        const isExpanded = expandedId === budget.id

        return (
          <Card key={budget.id} className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{budget.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {budget.categoryType === 'business' ? '💼' : '🏠'} {budget.category}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setExpandedId(isExpanded ? null : budget.id)}
              >
                {isExpanded ? '▼' : '▶'} Adjust
              </Button>
            </div>

            {/* Spending Summary */}
            <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Budget</p>
                <p className="font-semibold">{formatRM(adjustedBudgetAmount)}</p>
                {(adj.carryForward || adj.extraFunds) && (
                  <p className="text-xs text-muted-foreground">Base: {formatRM(budget.budgetAmount)}</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Spent</p>
                <p className="font-semibold">{formatRM(budget.spent || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Remaining</p>
                <p className={`font-semibold ${budget.remaining >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                  {formatRM(Math.abs(budget.remaining || 0))}
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
            {budget.isAlert && (
              <div className={`text-sm p-2 rounded mb-3 ${budget.isOverBudget ? 'bg-destructive/10 text-destructive' : 'bg-amber-50 text-amber-700'}`}>
                {budget.isOverBudget
                  ? `⚠️ Over budget by ${formatRM(Math.abs(budget.remaining))}`
                  : `⚠️ Approaching budget limit (${budget.alertThreshold || 80}%)`}
              </div>
            )}

            {/* Adjustments Section */}
            {isExpanded && (
              <div className="pt-4 border-t border-border space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Carry Forward from Previous</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">RM</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={
                          adjustments[budget.id]?.carryForward ??
                          (budget.adjustments?.carryForward || 0)
                        }
                        onChange={(e) => handleAdjustmentChange(budget.id, 'carryForward', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Extra Funds Added</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">RM</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={
                          adjustments[budget.id]?.extraFunds ?? (budget.adjustments?.extraFunds || 0)
                        }
                        onChange={(e) => handleAdjustmentChange(budget.id, 'extraFunds', e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded text-sm">
                  <p className="font-medium mb-1">Adjusted Budget: {formatRM(
                    Number(budget.budgetAmount) +
                    (parseFloat(adjustments[budget.id]?.carryForward || '0') || 0) +
                    (parseFloat(adjustments[budget.id]?.extraFunds || '0') || 0)
                  )}</p>
                  <p className="text-xs text-muted-foreground">Original: {formatRM(budget.budgetAmount)}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleSaveAdjustment(budget.id)}
                  className="w-full"
                >
                  Save Adjustments
                </Button>
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
