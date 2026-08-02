'use server'

import { getExpenses } from './expenses'
import { formatRM } from '@/lib/utils/currency'

// In-memory budget storage (in production, would use a database)
// For now, we'll use predefined budget templates
// In-memory budget adjustments per month (carry-forward and extra funds)
const budgetAdjustments: { [key: string]: { carryForward: number; extraFunds: number } } = {}

const DEFAULT_BUDGETS = [
  {
    id: 1,
    name: 'Groceries',
    category: 'Groceries',
    categoryType: 'household',
    budgetAmount: 800,
    period: 'monthly',
    alertThreshold: 80,
    notes: 'Monthly grocery budget',
  },
  {
    id: 2,
    name: 'Utilities',
    category: 'Utilities',
    categoryType: 'household',
    budgetAmount: 300,
    period: 'monthly',
    alertThreshold: 80,
    notes: 'Water, electricity, internet',
  },
  {
    id: 3,
    name: 'Transport',
    category: 'Transport',
    categoryType: 'household',
    budgetAmount: 400,
    period: 'monthly',
    alertThreshold: 80,
    notes: 'Gas, parking, public transport',
  },
  {
    id: 4,
    name: 'Dining Out',
    category: 'Dining',
    categoryType: 'household',
    budgetAmount: 500,
    period: 'monthly',
    alertThreshold: 80,
    notes: 'Restaurants and cafes',
  },
  {
    id: 5,
    name: 'Office Supplies',
    category: 'Office Supplies',
    categoryType: 'business',
    budgetAmount: 300,
    period: 'monthly',
    alertThreshold: 80,
    notes: 'Business supplies',
  },
]

export async function updateBudgetAdjustment(budgetId: number, month: string, carryForward: number, extraFunds: number) {
  const key = `${budgetId}-${month}`
  budgetAdjustments[key] = { carryForward, extraFunds }
}

export function getBudgetAdjustment(budgetId: number, month: string) {
  const key = `${budgetId}-${month}`
  return budgetAdjustments[key] || { carryForward: 0, extraFunds: 0 }
}

export async function getBudgets() {
  return DEFAULT_BUDGETS
}

export async function getBudgetById(id: number) {
  return DEFAULT_BUDGETS.find(b => b.id === id)
}

export async function getAllBudgetsStatus() {
  const allBudgets = await getBudgets()
  const currentMonth = new Date().toISOString().slice(0, 7)

  const budgetsWithStatus = await Promise.all(
    allBudgets.map(async (budget) => {
      const spent = await getSpentAmount(budget.category, budget.categoryType)
      const adjustments = getBudgetAdjustment(budget.id, currentMonth)
      const adjustedBudget = Number(budget.budgetAmount) + adjustments.carryForward + adjustments.extraFunds

      return {
        ...budget,
        spent,
        adjustments,
        adjustedBudget,
      }
    }),
  )

  return budgetsWithStatus.map((budget) => {
    const remaining = budget.adjustedBudget - budget.spent
    const percentage = (budget.spent / budget.adjustedBudget) * 100
    const isAlert = percentage >= budget.alertThreshold
    const isOverBudget = remaining < 0

    return {
      ...budget,
      remaining,
      percentage: Math.min(100, Math.round(percentage)),
      isAlert,
      isOverBudget,
      status: isOverBudget ? 'over' : isAlert ? 'warning' : 'ok',
    }
  })
}
  })
}

export async function getBudgetsByCategory(categoryType: string) {
  return DEFAULT_BUDGETS.filter(b => b.categoryType === categoryType)
}

export async function getBudgetSummary() {
  const budgetsWithStatus = await getAllBudgetsStatus()

  const summary = {
    totalBudget: budgetsWithStatus.reduce((sum, b) => sum + b.budgetAmount, 0),
    totalSpent: budgetsWithStatus.reduce((sum, b) => sum + b.spent, 0),
    totalRemaining: budgetsWithStatus.reduce((sum, b) => sum + b.remaining, 0),
    onTrack: budgetsWithStatus.filter(b => b.status === 'safe').length,
    warnings: budgetsWithStatus.filter(b => b.status === 'warning').length,
    overBudget: budgetsWithStatus.filter(b => b.status === 'over').length,
  }

  return summary
}
