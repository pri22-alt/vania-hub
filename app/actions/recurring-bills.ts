'use server'

import { db } from '@/lib/db'
import { recurringBills } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const SHARED_USER_ID = 'family-hub'

export async function getRecurringBills() {
  return db.select().from(recurringBills).where(eq(recurringBills.userId, SHARED_USER_ID))
}

export async function addRecurringBill(data: {
  description: string
  amount: string
  category: string
  dayOfMonth: number
  notes?: string
}) {
  await db.insert(recurringBills).values({
    userId: SHARED_USER_ID,
    description: data.description,
    amount: data.amount,
    category: data.category,
    dayOfMonth: data.dayOfMonth,
    notes: data.notes || null,
    isActive: true,
  })
  revalidatePath('/dues')
}

export async function updateRecurringBill(id: number, data: {
  description?: string
  amount?: string
  category?: string
  dayOfMonth?: number
  isActive?: boolean
  notes?: string
}) {
  await db.update(recurringBills).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(recurringBills.id, id))
  revalidatePath('/dues')
}

export async function deleteRecurringBill(id: number) {
  await db.delete(recurringBills).where(eq(recurringBills.id, id))
  revalidatePath('/dues')
}

export async function toggleRecurringBill(id: number, isActive: boolean) {
  await db.update(recurringBills).set({
    isActive,
    updatedAt: new Date(),
  }).where(eq(recurringBills.id, id))
  revalidatePath('/dues')
}
