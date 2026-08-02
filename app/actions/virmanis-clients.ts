'use server'

import { db } from '@/lib/db'
import { virmaisClients } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const SHARED_USER_ID = 'family-hub'

export async function getVirmaisClients() {
  const clients = await db
    .select()
    .from(virmaisClients)
    .where(eq(virmaisClients.userId, SHARED_USER_ID))
    .orderBy(virmaisClients.clientName)

  return clients
}

export async function addVirmaisClient(data: {
  clientName: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  purchaseFrequency?: string
  notes?: string
}) {
  await db.insert(virmaisClients).values({
    userId: SHARED_USER_ID,
    clientName: data.clientName,
    contactPerson: data.contactPerson || null,
    email: data.email || null,
    phone: data.phone || null,
    address: data.address || null,
    city: data.city || null,
    purchaseFrequency: data.purchaseFrequency || null,
    notes: data.notes || null,
  })
  revalidatePath('/virmanis')
}

export async function updateVirmaisClient(
  id: number,
  data: {
    clientName?: string
    contactPerson?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    purchaseFrequency?: string
    notes?: string
    isActive?: boolean
  }
) {
  await db
    .update(virmaisClients)
    .set(data)
    .where(and(eq(virmaisClients.id, id), eq(virmaisClients.userId, SHARED_USER_ID)))
  revalidatePath('/virmanis')
}

export async function deleteVirmaisClient(id: number) {
  await db
    .delete(virmaisClients)
    .where(and(eq(virmaisClients.id, id), eq(virmaisClients.userId, SHARED_USER_ID)))
  revalidatePath('/virmanis')
}

export async function updateClientTotalSpent(clientId: number, totalSpent: number) {
  await db
    .update(virmaisClients)
    .set({ totalSpent: totalSpent.toString() })
    .where(eq(virmaisClients.id, clientId))
}

export async function updateClientLastPurchaseDate(clientId: number, date: string) {
  await db
    .update(virmaisClients)
    .set({ lastPurchaseDate: date })
    .where(eq(virmaisClients.id, clientId))
}
