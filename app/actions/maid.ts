'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { maidAttendance } from '@/lib/db/schema'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getMaidAttendance(startDate?: string, endDate?: string) {
  const userId = await getUserId()
  
  let query = db
    .select()
    .from(maidAttendance)
    .where(eq(maidAttendance.userId, userId))

  if (startDate || endDate) {
    const conditions = [eq(maidAttendance.userId, userId)]
    if (startDate) conditions.push(gte(maidAttendance.date, startDate))
    if (endDate) conditions.push(lte(maidAttendance.date, endDate))
    query = db.select().from(maidAttendance).where(and(...conditions as any))
  }

  return query.orderBy(desc(maidAttendance.date))
}

export async function clockInMaid(date: string, notes?: string) {
  const userId = await getUserId()
  
  // Check if maid already clocked in today
  const existing = await db
    .select()
    .from(maidAttendance)
    .where(and(
      eq(maidAttendance.userId, userId),
      eq(maidAttendance.date, date)
    ))

  if (existing.length > 0 && existing[0].clockInTime) {
    // Already clocked in, return the existing record
    return existing[0]
  }

  const result = await db.insert(maidAttendance).values({
    userId,
    date,
    clockInTime: new Date().toISOString(),
    clockedInBy: 'manual',
    notes,
  })

  revalidatePath('/maid')
  return result
}

export async function clockOutMaid(id: number, notes?: string) {
  const userId = await getUserId()
  
  await db
    .update(maidAttendance)
    .set({
      clockOutTime: new Date().toISOString(),
      notes: notes || undefined,
    })
    .where(and(eq(maidAttendance.id, id), eq(maidAttendance.userId, userId)))

  revalidatePath('/maid')
}

export async function manualCheckIn(date: string, clockInTime: string, clockOutTime?: string, notes?: string) {
  const userId = await getUserId()
  
  const result = await db.insert(maidAttendance).values({
    userId,
    date,
    clockInTime: new Date(clockInTime).toISOString(),
    clockOutTime: clockOutTime ? new Date(clockOutTime).toISOString() : undefined,
    clockedInBy: 'manual',
    notes,
  })

  revalidatePath('/maid')
  return result
}

export async function deleteMaidRecord(id: number) {
  const userId = await getUserId()
  
  await db
    .delete(maidAttendance)
    .where(and(eq(maidAttendance.id, id), eq(maidAttendance.userId, userId)))

  revalidatePath('/maid')
}

export async function generateMaidQRLink() {
  const userId = await getUserId()
  
  // Generate a unique token for the maid link
  // This token will be used in the QR code to allow maid to clock in/out
  const token = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  return `/maid-link/${token}`
}
