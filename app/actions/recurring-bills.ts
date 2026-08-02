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
  startDate: string
  description: string
  amount: string
  category: string
  recurringType: string
  dayOfMonth?: number
  customDates?: string[]
  notes?: string
}) {
  const dayOfMonth = data.dayOfMonth || new Date(data.startDate).getDate()
  
  await db.insert(recurringBills).values({
    userId: SHARED_USER_ID,
    description: data.description,
    amount: data.amount,
    category: data.category,
    recurringType: data.recurringType,
    startDate: data.startDate,
    dayOfMonth: data.recurringType === 'monthly' ? dayOfMonth : null,
    customDates: data.customDates && data.customDates.length > 0 ? JSON.stringify(data.customDates) : null,
    notes: data.notes || null,
    isActive: true,
  })
  revalidatePath('/dues')
}

export async function updateRecurringBill(id: number, data: {
  description?: string
  amount?: string
  category?: string
  recurringType?: string
  dayOfMonth?: number | null
  customDates?: string[]
  isActive?: boolean
  notes?: string
}) {
  const updateData: any = { updatedAt: new Date() }
  if (data.description) updateData.description = data.description
  if (data.amount) updateData.amount = data.amount
  if (data.category) updateData.category = data.category
  if (data.recurringType) updateData.recurringType = data.recurringType
  if (data.dayOfMonth !== undefined) updateData.dayOfMonth = data.dayOfMonth
  if (data.customDates) updateData.customDates = data.customDates.length > 0 ? JSON.stringify(data.customDates) : null
  if (data.isActive !== undefined) updateData.isActive = data.isActive
  if (data.notes !== undefined) updateData.notes = data.notes

  await db.update(recurringBills).set(updateData).where(eq(recurringBills.id, id))
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
