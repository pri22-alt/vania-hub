'use server'

import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const SHARED_USER_ID = 'shared'

export async function getProducts(includeInactive = false) {
  const rows = await db.select().from(products).orderBy(asc(products.name))
  return includeInactive ? rows : rows.filter((p) => p.isActive)
}

export async function addProduct(data: {
  name: string
  unit: string
  unitPrice: string
  reorderLevel: string
  notes?: string
}) {
  await db.insert(products).values({
    userId: SHARED_USER_ID,
    name: data.name,
    unit: data.unit,
    unitPrice: data.unitPrice || '0',
    reorderLevel: data.reorderLevel || '0',
    notes: data.notes || null,
  })
  revalidatePath('/inventory')
  revalidatePath('/virmanis')
}

export async function updateProduct(id: number, data: {
  name?: string
  unit?: string
  unitPrice?: string
  reorderLevel?: string
  isActive?: boolean
  notes?: string
}) {
  await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id))
  revalidatePath('/inventory')
  revalidatePath('/virmanis')
}

export async function deleteProduct(id: number) {
  // Soft delete so historical movements keep their product reference
  await db.update(products).set({ isActive: false, updatedAt: new Date() }).where(eq(products.id, id))
  revalidatePath('/inventory')
  revalidatePath('/virmanis')
}
