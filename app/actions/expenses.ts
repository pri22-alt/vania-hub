'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { expenses } from '@/lib/db/schema'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getExpenses(startDate?: string, endDate?: string) {
  const userId = await getUserId()
  
  let query = db
    .select()
    .from(expenses)
    .where(eq(expenses.userId, userId))

  if (startDate || endDate) {
    const conditions = [eq(expenses.userId, userId)]
    if (startDate) conditions.push(gte(expenses.date, startDate))
    if (endDate) conditions.push(lte(expenses.date, endDate))
    query = db.select().from(expenses).where(and(...conditions as any))
  }

  return query.orderBy(desc(expenses.date))
}

export async function addExpense(data: {
  date: string
  description: string
  category: string
  amount: string
  paymentMethod: 'cash' | 'bank' | 'card'
  googleFormsLink?: string
  notes?: string
}) {
  const userId = await getUserId()
  
  const result = await db.insert(expenses).values({
    userId,
    date: data.date,
    description: data.description,
    category: data.category,
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    googleFormsLink: data.googleFormsLink,
    notes: data.notes,
  })

  revalidatePath('/expenses')
  return result
}

export async function updateExpense(
  id: number,
  data: Partial<typeof data>
) {
  const userId = await getUserId()
  
  await db
    .update(expenses)
    .set(data)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))

  revalidatePath('/expenses')
}

export async function deleteExpense(id: number) {
  const userId = await getUserId()
  
  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))

  revalidatePath('/expenses')
}

export async function getExpensesByCategory() {
  const userId = await getUserId()
  
  const result = await db
    .select({
      category: expenses.category,
      total: expenses.amount,
    })
    .from(expenses)
    .where(eq(expenses.userId, userId))

  return result
}
