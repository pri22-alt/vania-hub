'use server'

import { db } from '@/lib/db'
import { income } from '@/lib/db/schema'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const SHARED_USER_ID = 'shared'

export async function getIncome(startDate?: string, endDate?: string) {
  if (startDate && endDate) {
    return db.select().from(income)
      .where(and(gte(income.date, startDate), lte(income.date, endDate)))
      .orderBy(desc(income.date))
  }
  return db.select().from(income).orderBy(desc(income.date))
}

export async function addIncome(data: {
  date: string
  description: string
  categoryType: string
  category: string
  subcategory?: string
  amount: string
  source: string
  remarks?: string
  notes?: string
  driveFileId?: string
  driveFileUrl?: string
}) {
  await db.insert(income).values({
    userId: SHARED_USER_ID,
    date: data.date,
    description: data.description,
    categoryType: data.categoryType,
    category: data.category,
    subcategory: data.subcategory || null,
    amount: data.amount,
    source: data.source,
    remarks: data.remarks || null,
    notes: data.notes || null,
    driveFileId: data.driveFileId || null,
    driveFileUrl: data.driveFileUrl || null,
  })
  revalidatePath('/income')
}

export async function updateIncome(id: number, data: {
  date?: string
  description?: string
  amount?: string
  source?: string
  notes?: string
}) {
  await db.update(income).set({ ...data, updatedAt: new Date() }).where(eq(income.id, id))
  revalidatePath('/income')
}

export async function deleteIncome(id: number) {
  await db.delete(income).where(eq(income.id, id))
  revalidatePath('/income')
}
