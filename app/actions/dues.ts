'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { dues } from '@/lib/db/schema'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getDues(startDate?: string, endDate?: string) {
  const userId = await getUserId()
  
  let query = db
    .select()
    .from(dues)
    .where(eq(dues.userId, userId))

  if (startDate || endDate) {
    const conditions = [eq(dues.userId, userId)]
    if (startDate) conditions.push(gte(dues.date, startDate))
    if (endDate) conditions.push(lte(dues.date, endDate))
    query = db.select().from(dues).where(and(...conditions as any))
  }

  return query.orderBy(desc(dues.date))
}

export async function addDue(data: {
  date: string
  description: string
  amount: string
  category?: string
  notes?: string
}) {
  const userId = await getUserId()
  
  const result = await db.insert(dues).values({
    userId,
    date: data.date,
    description: data.description,
    amount: data.amount,
    category: data.category,
    notes: data.notes,
    status: 'pending',
  })

  revalidatePath('/dues')
  return result
}

export async function updateDue(
  id: number,
  data: Partial<typeof data>
) {
  const userId = await getUserId()
  
  await db
    .update(dues)
    .set(data)
    .where(and(eq(dues.id, id), eq(dues.userId, userId)))

  revalidatePath('/dues')
}

export async function markDueAsPaid(id: number) {
  const userId = await getUserId()
  
  await db
    .update(dues)
    .set({
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
    })
    .where(and(eq(dues.id, id), eq(dues.userId, userId)))

  revalidatePath('/dues')
}

export async function deleteDue(id: number) {
  const userId = await getUserId()
  
  await db
    .delete(dues)
    .where(and(eq(dues.id, id), eq(dues.userId, userId)))

  revalidatePath('/dues')
}
