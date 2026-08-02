'use server'

import { getExpenses } from './expenses'
import { formatRM } from '@/lib/utils/currency'

// In-memory budget storage (in production, would use a database)
// For now, we'll use predefined budget templates
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

export async function getBudgets() {
  return DEFAULT_BUDGETS
}

export async function getBudgetById(id: number) {
  return DEFAULT_BUDGETS.find(b => b.id === id)
}

export async function getAllBudgetsStatus() {
  const allBudgets = DEFAULT_BUDGETS
  const expenses = await getExpenses()
  const currentMonth = new Date().toISOString().slice(0, 7)

  return allBudgets.map(budget => {
    // Calculate spending for this budget's category this month
    const budgetSpending = expenses
      .filter(exp => {
        const expMonth = exp.date instanceof Date 
          ? exp.date.toISOString().slice(0, 7)
          : typeof exp.date === 'string' 
          ? exp.date.slice(0, 7)
          : new Date(exp.date).toISOString().slice(0, 7)
        return exp.category === budget.category && expMonth === currentMonth
      })
      .reduce((sum, exp) => sum + Number(exp.amount), 0)

    const budgetAmount = Number(budget.budgetAmount)
    const percentageUsed = budgetAmount > 0 ? (budgetSpending / budgetAmount) * 100 : 0
    const remaining = budgetAmount - budgetSpending
    const isOverBudget = budgetSpending > budgetAmount
    const isWarning = percentageUsed >= budget.alertThreshold

    return {
      ...budget,
      spent: budgetSpending,
      remaining: Math.max(0, remaining),
      percentageUsed: Math.round(percentageUsed),
      isOverBudget,
      isWarning,
      status: isOverBudget ? 'over' : isWarning ? 'warning' : 'safe',
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
