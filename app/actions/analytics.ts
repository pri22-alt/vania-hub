'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { expenses, income, cheeseSales, dues } from '@/lib/db/schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getFinancialOverview(monthYear?: string) {
  const userId = await getUserId()
  const currentMonth = monthYear || new Date().toISOString().slice(0, 7)
  
  // Total Expenses
  const expensesData = await db
    .select({
      total: sql<number>`SUM(CAST("amount" AS FLOAT))`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        sql`TO_CHAR("date", 'YYYY-MM') = ${currentMonth}`
      )
    )

  // Total Income
  const incomeData = await db
    .select({
      total: sql<number>`SUM(CAST("amount" AS FLOAT))`,
    })
    .from(income)
    .where(
      and(
        eq(income.userId, userId),
        sql`TO_CHAR("date", 'YYYY-MM') = ${currentMonth}`
      )
    )

  // Cheese Sales
  const salesData = await db
    .select({
      total: sql<number>`SUM(CAST("totalAmount" AS FLOAT))`,
    })
    .from(cheeseSales)
    .where(
      and(
        eq(cheeseSales.userId, userId),
        sql`TO_CHAR("date", 'YYYY-MM') = ${currentMonth}`
      )
    )

  // Pending Dues
  const pendingDuesData = await db
    .select({
      total: sql<number>`SUM(CAST("amount" AS FLOAT))`,
    })
    .from(dues)
    .where(
      and(
        eq(dues.userId, userId),
        eq(dues.status, 'pending')
      )
    )

  return {
    totalExpenses: expensesData[0]?.total || 0,
    totalIncome: incomeData[0]?.total || 0,
    totalSales: salesData[0]?.total || 0,
    pendingDues: pendingDuesData[0]?.total || 0,
  }
}

export async function getExpensesByCategory(monthYear?: string) {
  const userId = await getUserId()
  const currentMonth = monthYear || new Date().toISOString().slice(0, 7)

  return db
    .select({
      category: expenses.category,
      total: sql<number>`SUM(CAST("amount" AS FLOAT))`,
      count: sql<number>`COUNT(*)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        sql`TO_CHAR("date", 'YYYY-MM') = ${currentMonth}`
      )
    )
    .groupBy(expenses.category)
    .orderBy(desc(sql`SUM(CAST("amount" AS FLOAT))`))
}

export async function getPaymentMethodBreakdown(monthYear?: string) {
  const userId = await getUserId()
  const currentMonth = monthYear || new Date().toISOString().slice(0, 7)

  return db
    .select({
      method: expenses.paymentMethod,
      total: sql<number>`SUM(CAST("amount" AS FLOAT))`,
      count: sql<number>`COUNT(*)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        sql`TO_CHAR("date", 'YYYY-MM') = ${currentMonth}`
      )
    )
    .groupBy(expenses.paymentMethod)
}

export async function getDailyTotals(startDate: string, endDate: string) {
  const userId = await getUserId()

  const expensesByDay = await db
    .select({
      date: expenses.date,
      total: sql<number>`SUM(CAST("amount" AS FLOAT))`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      )
    )
    .groupBy(expenses.date)
    .orderBy(desc(expenses.date))

  return expensesByDay
}
