'use server'

import { db } from '@/lib/db'
import { expenses, income, virmanisSales, dues } from '@/lib/db/schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'

export async function getFinancialOverview(startDate?: string, endDate?: string) {
  const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const end = endDate || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]

  const [expensesData, incomeData, salesData, pendingDuesData] = await Promise.all([
    db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)` })
      .from(expenses)
      .where(and(gte(expenses.date, start), lte(expenses.date, end))),
    db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)` })
      .from(income)
      .where(and(gte(income.date, start), lte(income.date, end))),
    db.select({ total: sql<number>`COALESCE(SUM(CAST(totalamount AS FLOAT)), 0)` })
      .from(virmanisSales)
      .where(and(gte(virmanisSales.date, start), lte(virmanisSales.date, end))),
    db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)` })
      .from(dues)
      .where(eq(dues.status, 'pending')),
  ])

  return {
    totalExpenses: Number(expensesData[0]?.total || 0),
    totalIncome: Number(incomeData[0]?.total || 0),
    totalSales: Number(salesData[0]?.total || 0),
    pendingDues: Number(pendingDuesData[0]?.total || 0),
  }
}

export async function getExpensesByCategory(startDate?: string, endDate?: string) {
  const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const end = endDate || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  return db.select({
    category: expenses.category,
    total: sql<number>`SUM(CAST(amount AS FLOAT))`,
    count: sql<number>`COUNT(*)`,
  })
  .from(expenses)
  .where(and(gte(expenses.date, start), lte(expenses.date, end)))
  .groupBy(expenses.category)
  .orderBy(desc(sql`SUM(CAST(amount AS FLOAT))`))
}

export async function getPaymentMethodBreakdown(startDate?: string, endDate?: string) {
  const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const end = endDate || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  return db.select({
    method: expenses.paymentMethod,
    total: sql<number>`SUM(CAST(amount AS FLOAT))`,
    count: sql<number>`COUNT(*)`,
  })
  .from(expenses)
  .where(and(gte(expenses.date, start), lte(expenses.date, end)))
  .groupBy(expenses.paymentMethod)
}
