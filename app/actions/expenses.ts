'use server'

import { db } from '@/lib/db'
import { expenses } from '@/lib/db/schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const SHARED_USER_ID = 'shared'

export async function getExpenses(startDate?: string, endDate?: string) {
  if (startDate && endDate) {
    return db.select().from(expenses)
      .where(and(gte(expenses.date, startDate), lte(expenses.date, endDate)))
      .orderBy(desc(expenses.date))
  }
  return db.select().from(expenses).orderBy(desc(expenses.date))
}

export async function addExpense(data: {
  date: string
  description: string
  categoryType: string
  category: string
  subcategory?: string
  amount: string
  paymentMethod: string
  googleFormsLink?: string
  remarks?: string
  notes?: string
}) {
  await db.insert(expenses).values({
    userId: SHARED_USER_ID,
    date: data.date,
    description: data.description,
    categoryType: data.categoryType,
    category: data.category,
    subcategory: data.subcategory || null,
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    googleFormsLink: data.googleFormsLink || null,
    remarks: data.remarks || null,
    notes: data.notes || null,
  })
  revalidatePath('/expenses')
}

export async function updateExpense(id: number, data: {
  date?: string
  description?: string
  category?: string
  amount?: string
  paymentMethod?: string
  googleFormsLink?: string
  notes?: string
}) {
  await db.update(expenses).set({ ...data, updatedAt: new Date() }).where(eq(expenses.id, id))
  revalidatePath('/expenses')
}

export async function deleteExpense(id: number) {
  await db.delete(expenses).where(eq(expenses.id, id))
  revalidatePath('/expenses')
}

export async function getExpensesByCategory(monthYear?: string) {
  const currentMonth = monthYear || new Date().toISOString().slice(0, 7)
  return db.select({
    category: expenses.category,
    total: sql<number>`SUM(CAST(amount AS FLOAT))`,
    count: sql<number>`COUNT(*)`,
  })
  .from(expenses)
  .where(sql`TO_CHAR(date, 'YYYY-MM') = ${currentMonth}`)
  .groupBy(expenses.category)
  .orderBy(desc(sql`SUM(CAST(amount AS FLOAT))`))
}
