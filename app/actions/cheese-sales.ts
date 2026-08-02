'use server'

import { db } from '@/lib/db'
import { cheeseSales } from '@/lib/db/schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const SHARED_USER_ID = 'shared'

export async function getCheesSales(startDate?: string, endDate?: string) {
  if (startDate && endDate) {
    return db.select().from(cheeseSales)
      .where(and(gte(cheeseSales.date, startDate), lte(cheeseSales.date, endDate)))
      .orderBy(desc(cheeseSales.date))
  }
  return db.select().from(cheeseSales).orderBy(desc(cheeseSales.date))
}

export async function addCheeseSale(data: {
  date: string
  customerName: string
  productName: string
  quantity: string
  unitPrice: string
  totalAmount: string
  paymentMethod: string
  notes?: string
}) {
  await db.insert(cheeseSales).values({
    userId: SHARED_USER_ID,
    date: data.date,
    customerName: data.customerName,
    productName: data.productName,
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    totalAmount: data.totalAmount,
    paymentMethod: data.paymentMethod,
    notes: data.notes || null,
  })
  revalidatePath('/cheese-sales')
}

export async function updateCheeseSale(id: number, data: {
  date?: string
  customerName?: string
  productName?: string
  quantity?: string
  unitPrice?: string
  totalAmount?: string
  paymentMethod?: string
  notes?: string
}) {
  await db.update(cheeseSales).set({ ...data, updatedAt: new Date() }).where(eq(cheeseSales.id, id))
  revalidatePath('/cheese-sales')
}

export async function deleteCheeseSale(id: number) {
  await db.delete(cheeseSales).where(eq(cheeseSales.id, id))
  revalidatePath('/cheese-sales')
}

export async function getSalesStats(monthYear?: string) {
  const currentMonth = monthYear || new Date().toISOString().slice(0, 7)
  return db.select({
    totalSales: sql<number>`COALESCE(SUM(CAST(totalAmount AS FLOAT)), 0)`,
    totalQuantity: sql<number>`COALESCE(SUM(CAST(quantity AS FLOAT)), 0)`,
    transactionCount: sql<number>`COUNT(*)`,
    avgTransactionValue: sql<number>`COALESCE(AVG(CAST(totalAmount AS FLOAT)), 0)`,
  })
  .from(cheeseSales)
  .where(sql`TO_CHAR(date, 'YYYY-MM') = ${currentMonth}`)
}

export async function getSalesByCustomer() {
  return db.select({
    customerName: cheeseSales.customerName,
    totalAmount: sql<number>`SUM(CAST(totalAmount AS FLOAT))`,
    transactionCount: sql<number>`COUNT(*)`,
  })
  .from(cheeseSales)
  .groupBy(cheeseSales.customerName)
  .orderBy(desc(sql`SUM(CAST(totalAmount AS FLOAT))`))
}

export async function getSalesByProduct() {
  return db.select({
    productName: cheeseSales.productName,
    totalAmount: sql<number>`SUM(CAST(totalAmount AS FLOAT))`,
    totalQuantity: sql<number>`SUM(CAST(quantity AS FLOAT))`,
    transactionCount: sql<number>`COUNT(*)`,
  })
  .from(cheeseSales)
  .groupBy(cheeseSales.productName)
  .orderBy(desc(sql`SUM(CAST(totalAmount AS FLOAT))`))
}
