'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { income } from '@/lib/db/schema'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getIncome(startDate?: string, endDate?: string) {
  const userId = await getUserId()
  
  let query = db
    .select()
    .from(income)
    .where(eq(income.userId, userId))

  if (startDate || endDate) {
    const conditions = [eq(income.userId, userId)]
    if (startDate) conditions.push(gte(income.date, startDate))
    if (endDate) conditions.push(lte(income.date, endDate))
    query = db.select().from(income).where(and(...conditions as any))
  }

  return query.orderBy(desc(income.date))
}

export async function addIncome(data: {
  date: string
  description: string
  amount: string
  source: 'cash' | 'bank_transfer'
  notes?: string
}) {
  const userId = await getUserId()
  
  const result = await db.insert(income).values({
    userId,
    date: data.date,
    description: data.description,
    amount: data.amount,
    source: data.source,
    notes: data.notes,
  })

  revalidatePath('/income')
  return result
}

export async function updateIncome(
  id: number,
  data: Partial<typeof data>
) {
  const userId = await getUserId()
  
  await db
    .update(income)
    .set(data)
    .where(and(eq(income.id, id), eq(income.userId, userId)))

  revalidatePath('/income')
}

export async function deleteIncome(id: number) {
  const userId = await getUserId()
  
  await db
    .delete(income)
    .where(and(eq(income.id, id), eq(income.userId, userId)))

  revalidatePath('/income')
}
