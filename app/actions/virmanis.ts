'use server'

import { db } from '@/lib/db'
import { virmanisSales } from '@/lib/db/schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const SHARED_USER_ID = 'shared'

export async function getVirmanisSales(startDate?: string, endDate?: string) {
  if (startDate && endDate) {
    return db.select().from(virmanisSales)
      .where(and(gte(virmanisSales.date, startDate), lte(virmanisSales.date, endDate)))
      .orderBy(desc(virmanisSales.date))
  }
  return db.select().from(virmanisSales).orderBy(desc(virmanisSales.date))
}

export async function addVirmanisSale(data: {
  date: string
  customerName: string
  productName: string
  quantity: string
  unitPrice: string
  totalAmount: string
  paymentMethod: string
  remarks?: string
  notes?: string
}) {
  await db.insert(virmanisSales).values({
    userId: SHARED_USER_ID,
    date: data.date,
    customerName: data.customerName,
    productName: data.productName,
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    totalAmount: data.totalAmount,
    paymentMethod: data.paymentMethod,
    remarks: data.remarks || null,
    notes: data.notes || null,
  })
  revalidatePath('/virmanis')
}

export async function updateVirmanisSale(id: number, data: {
  date?: string
  customerName?: string
  productName?: string
  quantity?: string
  unitPrice?: string
  totalAmount?: string
  paymentMethod?: string
  remarks?: string
  notes?: string
}) {
  await db.update(virmanisSales).set({ ...data, updatedAt: new Date() }).where(eq(virmanisSales.id, id))
  revalidatePath('/virmanis')
}

export async function deleteVirmanisSale(id: number) {
  await db.delete(virmanisSales).where(eq(virmanisSales.id, id))
  revalidatePath('/virmanis')
}

export async function getSalesStats() {
  const currentMonth = new Date().toISOString().slice(0, 7)
  return db.select({
    totalSales: sql<number>`SUM(CAST(totalamount AS FLOAT))`,
    transactionCount: sql<number>`COUNT(*)`,
    avgSaleAmount: sql<number>`AVG(CAST(totalamount AS FLOAT))`,
  })
  .from(virmanisSales)
  .where(sql`TO_CHAR(date, 'YYYY-MM') = ${currentMonth}`)
}

export async function getSalesByCustomer() {
  const currentMonth = new Date().toISOString().slice(0, 7)
  return db.select({
    customerName: virmanisSales.customerName,
    total: sql<number>`SUM(CAST(totalamount AS FLOAT))`,
    count: sql<number>`COUNT(*)`,
  })
  .from(virmanisSales)
  .where(sql`TO_CHAR(date, 'YYYY-MM') = ${currentMonth}`)
  .groupBy(virmanisSales.customerName)
  .orderBy(desc(sql`SUM(CAST(totalamount AS FLOAT))`))
}

export async function getSalesByProduct() {
  const currentMonth = new Date().toISOString().slice(0, 7)
  return db.select({
    productName: virmanisSales.productName,
    total: sql<number>`SUM(CAST(totalamount AS FLOAT))`,
    quantity: sql<number>`SUM(CAST(quantity AS FLOAT))`,
  })
  .from(virmanisSales)
  .where(sql`TO_CHAR(date, 'YYYY-MM') = ${currentMonth}`)
  .groupBy(virmanisSales.productName)
  .orderBy(desc(sql`SUM(CAST(totalamount AS FLOAT))`))
}
