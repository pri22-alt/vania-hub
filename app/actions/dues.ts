'use server'

import { db } from '@/lib/db'
import { dues } from '@/lib/db/schema'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const SHARED_USER_ID = 'family-hub'

export async function getDues(startDate?: string, endDate?: string) {
  if (startDate && endDate) {
    return db.select().from(dues)
      .where(and(gte(dues.date, startDate), lte(dues.date, endDate)))
      .orderBy(desc(dues.date))
  }
  return db.select().from(dues).orderBy(desc(dues.date))
}

export async function addDue(data: {
  date: string
  description: string
  amount: string
  category?: string
  notes?: string
}) {
  await db.insert(dues).values({
    userId: SHARED_USER_ID,
    date: data.date,
    description: data.description,
    amount: data.amount,
    category: data.category || null,
    notes: data.notes || null,
    status: 'pending',
  })
  revalidatePath('/dues')
}

export async function markDueAsPaid(id: number) {
  await db.update(dues).set({
    status: 'paid',
    paidDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date(),
  }).where(eq(dues.id, id))
  revalidatePath('/dues')
}

export async function updateDue(id: number, data: {
  date?: string
  description?: string
  amount?: string
  category?: string
  notes?: string
  status?: string
}) {
  await db.update(dues).set({ ...data, updatedAt: new Date() }).where(eq(dues.id, id))
  revalidatePath('/dues')
}

export async function deleteDue(id: number) {
  await db.delete(dues).where(eq(dues.id, id))
  revalidatePath('/dues')
}
