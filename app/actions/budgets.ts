'use server'

import { db } from '@/lib/db'
import { budgets, expenses, income } from '@/lib/db/schema'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const SHARED_USER_ID = 'shared-user-123'

export async function addBudget(data: {
  name: string
  categoryType: string
  category: string
  budgetAmount: string
  period: string
  month?: string
  alertThreshold?: number
  notes?: string
}) {
  await db.insert(budgets).values({
    userId: SHARED_USER_ID,
    name: data.name,
    categoryType: data.categoryType,
    category: data.category,
    budgetAmount: data.budgetAmount,
    period: data.period,
    month: data.month || null,
    alertThreshold: data.alertThreshold || 80,
    notes: data.notes || null,
    isActive: true,
  })
  revalidatePath('/budgets')
}

export async function getBudgets() {
  return db.select().from(budgets).where(eq(budgets.userId, SHARED_USER_ID)).orderBy(budgets.createdAt)
}

export async function getBudgetById(id: number) {
  const result = await db.select().from(budgets).where(eq(budgets.id, id))
  return result[0] || null
}

export async function updateBudget(id: number, data: {
  name?: string
  budgetAmount?: string
  alertThreshold?: number
  notes?: string
  isActive?: boolean
}) {
  await db.update(budgets).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(budgets.id, id))
  revalidatePath('/budgets')
}

export async function deleteBudget(id: number) {
  await db.delete(budgets).where(eq(budgets.id, id))
  revalidatePath('/budgets')
}

export async function getBudgetStatus(budgetId: number) {
  const budget = await getBudgetById(budgetId)
  if (!budget) return null

  // Calculate spent amount based on budget period and category
  const monthYearStr = budget.month || new Date().toISOString().slice(0, 7)
  const startDate = `${monthYearStr}-01`
  const endDate = new Date(parseInt(monthYearStr.split('-')[0]), parseInt(monthYearStr.split('-')[1]), 0).toISOString().split('T')[0]

  let spentAmount = 0

  if (budget.categoryType === 'household') {
    const expenseData = await db.select({
      total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
    })
      .from(expenses)
      .where(and(
        eq(expenses.userId, SHARED_USER_ID),
        eq(expenses.categoryType, 'household'),
        eq(expenses.category, budget.category),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate),
      ))

    spentAmount = Number(expenseData[0]?.total || 0)
  } else if (budget.categoryType === 'business') {
    const expenseData = await db.select({
      total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
    })
      .from(expenses)
      .where(and(
        eq(expenses.userId, SHARED_USER_ID),
        eq(expenses.categoryType, 'business'),
        eq(expenses.category, budget.category),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate),
      ))

    spentAmount = Number(expenseData[0]?.total || 0)
  }

  const budgetAmountNum = Number(budget.budgetAmount)
  const percentUsed = (spentAmount / budgetAmountNum) * 100
  const remaining = budgetAmountNum - spentAmount
  const isOverBudget = spentAmount > budgetAmountNum
  const alertThreshold = budget.alertThreshold || 80
  const shouldAlert = percentUsed >= alertThreshold

  return {
    budgetAmount: budgetAmountNum,
    spentAmount,
    remaining,
    percentUsed,
    isOverBudget,
    shouldAlert,
  }
}

export async function getAllBudgetsStatus() {
  const allBudgets = await getBudgets()
  const budgetsWithStatus = await Promise.all(
    allBudgets.map(async (budget) => ({
      ...budget,
      status: await getBudgetStatus(budget.id),
    }))
  )
  return budgetsWithStatus
}
