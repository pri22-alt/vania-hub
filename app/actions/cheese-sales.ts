'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cheeseSales } from '@/lib/db/schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getCheesSales(startDate?: string, endDate?: string) {
  const userId = await getUserId()
  
  let query = db
    .select()
    .from(cheeseSales)
    .where(eq(cheeseSales.userId, userId))

  if (startDate || endDate) {
    const conditions = [eq(cheeseSales.userId, userId)]
    if (startDate) conditions.push(gte(cheeseSales.date, startDate))
    if (endDate) conditions.push(lte(cheeseSales.date, endDate))
    query = db.select().from(cheeseSales).where(and(...conditions as any))
  }

  return query.orderBy(desc(cheeseSales.date))
}

export async function addCheeseSale(data: {
  date: string
  customerName: string
  productName: string
  quantity: string
  unitPrice: string
  totalAmount: string
  paymentMethod: 'cash' | 'bank' | 'card'
  notes?: string
}) {
  const userId = await getUserId()
  
  const result = await db.insert(cheeseSales).values({
    userId,
    date: data.date,
    customerName: data.customerName,
    productName: data.productName,
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    totalAmount: data.totalAmount,
    paymentMethod: data.paymentMethod,
    notes: data.notes,
  })

  revalidatePath('/cheese-sales')
  return result
}

export async function updateCheeseSale(
  id: number,
  data: Partial<typeof data>
) {
  const userId = await getUserId()
  
  await db
    .update(cheeseSales)
    .set(data)
    .where(and(eq(cheeseSales.id, id), eq(cheeseSales.userId, userId)))

  revalidatePath('/cheese-sales')
}

export async function deleteCheeseSale(id: number) {
  const userId = await getUserId()
  
  await db
    .delete(cheeseSales)
    .where(and(eq(cheeseSales.id, id), eq(cheeseSales.userId, userId)))

  revalidatePath('/cheese-sales')
}

export async function getSalesStats(monthYear?: string) {
  const userId = await getUserId()
  
  let query = db
    .select({
      totalSales: sql<number>`SUM(CAST("totalAmount" AS FLOAT))`,
      totalQuantity: sql<number>`SUM(CAST("quantity" AS FLOAT))`,
      transactionCount: sql<number>`COUNT(*)`,
      avgTransactionValue: sql<number>`AVG(CAST("totalAmount" AS FLOAT))`,
    })
    .from(cheeseSales)
    .where(eq(cheeseSales.userId, userId))

  if (monthYear) {
    query = db
      .select({
        totalSales: sql<number>`SUM(CAST("totalAmount" AS FLOAT))`,
        totalQuantity: sql<number>`SUM(CAST("quantity" AS FLOAT))`,
        transactionCount: sql<number>`COUNT(*)`,
        avgTransactionValue: sql<number>`AVG(CAST("totalAmount" AS FLOAT))`,
      })
      .from(cheeseSales)
      .where(
        and(
          eq(cheeseSales.userId, userId),
          sql`TO_CHAR("date", 'YYYY-MM') = ${monthYear}`
        )
      )
  }

  return query
}

export async function getSalesByCustomer() {
  const userId = await getUserId()
  
  return db
    .select({
      customerName: cheeseSales.customerName,
      totalAmount: sql<number>`SUM(CAST("totalAmount" AS FLOAT))`,
      totalQuantity: sql<number>`SUM(CAST("quantity" AS FLOAT))`,
      transactionCount: sql<number>`COUNT(*)`,
    })
    .from(cheeseSales)
    .where(eq(cheeseSales.userId, userId))
    .groupBy(cheeseSales.customerName)
    .orderBy(desc(sql`SUM(CAST("totalAmount" AS FLOAT))`))
}

export async function getSalesByProduct() {
  const userId = await getUserId()
  
  return db
    .select({
      productName: cheeseSales.productName,
      totalAmount: sql<number>`SUM(CAST("totalAmount" AS FLOAT))`,
      totalQuantity: sql<number>`SUM(CAST("quantity" AS FLOAT))`,
      transactionCount: sql<number>`COUNT(*)`,
    })
    .from(cheeseSales)
    .where(eq(cheeseSales.userId, userId))
    .groupBy(cheeseSales.productName)
    .orderBy(desc(sql`SUM(CAST("totalAmount" AS FLOAT))`))
}

export async function generateSalesReport(startDate: string, endDate: string) {
  const userId = await getUserId()
  
  const sales = await db
    .select()
    .from(cheeseSales)
    .where(
      and(
        eq(cheeseSales.userId, userId),
        gte(cheeseSales.date, startDate),
        lte(cheeseSales.date, endDate)
      )
    )
    .orderBy(desc(cheeseSales.date))

  return sales
}
