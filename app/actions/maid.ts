'use server'

import { db } from '@/lib/db'
import { maidAttendance } from '@/lib/db/schema'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const SHARED_USER_ID = 'shared'

export async function getMaidAttendance(startDate?: string, endDate?: string) {
  if (startDate && endDate) {
    return db.select().from(maidAttendance)
      .where(and(gte(maidAttendance.date, startDate), lte(maidAttendance.date, endDate)))
      .orderBy(desc(maidAttendance.date))
  }
  return db.select().from(maidAttendance).orderBy(desc(maidAttendance.date))
}

export async function clockInMaid(date: string, notes?: string) {
  const existing = await db.select().from(maidAttendance)
    .where(eq(maidAttendance.date, date))

  if (existing.length > 0) {
    return existing[0]
  }

  await db.insert(maidAttendance).values({
    userId: SHARED_USER_ID,
    date,
    clockInTime: new Date(),
    clockedInBy: 'manual',
    notes: notes || null,
  })
  revalidatePath('/maid')
}

export async function clockOutMaid(id: number) {
  await db.update(maidAttendance).set({
    clockOutTime: new Date(),
    updatedAt: new Date(),
  }).where(eq(maidAttendance.id, id))
  revalidatePath('/maid')
}

export async function manualCheckIn(date: string, clockInTime: string, clockOutTime?: string, notes?: string) {
  await db.insert(maidAttendance).values({
    userId: SHARED_USER_ID,
    date,
    clockInTime: new Date(clockInTime),
    clockOutTime: clockOutTime ? new Date(clockOutTime) : null,
    clockedInBy: 'manual',
    notes: notes || null,
  })
  revalidatePath('/maid')
}

export async function deleteMaidRecord(id: number) {
  await db.delete(maidAttendance).where(eq(maidAttendance.id, id))
  revalidatePath('/maid')
}

export async function generateMaidQRLink() {
  return `/maid-link/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
