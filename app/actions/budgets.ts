'use server'

import { db } from '@/lib/db'
import { expenses } from '@/lib/db/schema'
import { and, eq, gte, lte } from 'drizzle-orm'
import { getExpenses } from './expenses'
import { formatRM } from '@/lib/utils/currency'
import { budgetAdjustments, updateBudgetAdjustmentSync, getBudgetAdjustment } from '@/lib/utils/budget-utils'

// In-memory custom budget amounts (can be overridden from defaults)
const customBudgetAmounts: { [key: number]: number } = {}

// Get total spent for a category in the current month
async function getSpentAmount(category: string, categoryType: string): Promise<number> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const result = await db
    .select({
      total: expenses.amount,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.category, category),
        eq(expenses.categoryType, categoryType),
        gte(expenses.date, monthStart),
        lte(expenses.date, monthEnd)
      )
    )

  return result.reduce((sum, row) => sum + Number(row.total || 0), 0)
}

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
  updateBudgetAdjustmentSync(budgetId, month, carryForward, extraFunds)
}

export async function updateBudgetAmount(budgetId: number, newAmount: number) {
  customBudgetAmounts[budgetId] = newAmount
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
      budgetAmount: finalBudgetAmount,
      remaining: finalBudgetAmount - spent,
      percentage: Math.min(100, Math.round((spent / finalBudgetAmount) * 100)),
      isAlert: (spent / finalBudgetAmount) * 100 >= (budget.alertThreshold || 80) || (spent > finalBudgetAmount),
      isOverBudget: spent > finalBudgetAmount,
      status: spent > finalBudgetAmount ? 'over' : (spent / finalBudgetAmount) * 100 >= (budget.alertThreshold || 80) ? 'warning' : 'ok',
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
