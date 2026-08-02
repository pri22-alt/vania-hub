'use server'

import { db } from '@/lib/db'
import { inventoryMovements, orders, orderItems, products } from '@/lib/db/schema'
import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const SHARED_USER_ID = 'shared'

/**
 * Internal: append a signed movement to the ledger.
 * Positive quantity = stock in, negative = stock out.
 */
export async function recordMovement(data: {
  productId: number
  movementType: 'opening' | 'purchase' | 'sale' | 'adjustment'
  quantity: number
  movementDate: string
  referenceType?: 'expense' | 'order' | 'sale' | 'manual'
  referenceId?: number
  notes?: string
}) {
  await db.insert(inventoryMovements).values({
    userId: SHARED_USER_ID,
    productId: data.productId,
    movementType: data.movementType,
    quantity: String(data.quantity),
    movementDate: data.movementDate,
    referenceType: data.referenceType || null,
    referenceId: data.referenceId || null,
    notes: data.notes || null,
  })
}

/** Manual stock-in (not tied to an expense). */
export async function addManualStockIn(data: {
  productId: number
  quantity: string
  date: string
  notes?: string
}) {
  await recordMovement({
    productId: data.productId,
    movementType: 'purchase',
    quantity: Math.abs(Number(data.quantity)),
    movementDate: data.date,
    referenceType: 'manual',
    notes: data.notes || 'Manual stock-in',
  })
  revalidatePath('/inventory')
}

/** Set the opening stock count for a product (typically on the 1st of the month). */
export async function setOpeningStock(data: {
  productId: number
  quantity: string
  date: string
  notes?: string
}) {
  await recordMovement({
    productId: data.productId,
    movementType: 'opening',
    quantity: Number(data.quantity),
    movementDate: data.date,
    referenceType: 'manual',
    notes: data.notes || 'Monthly opening count',
  })
  revalidatePath('/inventory')
}

/** Manual stock adjustment (can be positive or negative). */
export async function addAdjustment(data: {
  productId: number
  quantity: string
  date: string
  notes?: string
}) {
  await recordMovement({
    productId: data.productId,
    movementType: 'adjustment',
    quantity: Number(data.quantity),
    movementDate: data.date,
    referenceType: 'manual',
    notes: data.notes || 'Adjustment',
  })
  revalidatePath('/inventory')
}

/**
 * Stock status per product:
 *  - onHand   = sum of all ledger movements (physical stock)
 *  - reserved = quantity committed to packed (not yet completed) orders
 *  - available = onHand - reserved
 */
export async function getStockStatus() {
  const allProducts = await db.select().from(products).where(eq(products.isActive, true)).orderBy(asc(products.name))

  // On-hand totals from the ledger
  const onHandRows = await db
    .select({
      productId: inventoryMovements.productId,
      onHand: sql<number>`COALESCE(SUM(CAST(${inventoryMovements.quantity} AS FLOAT)), 0)`,
    })
    .from(inventoryMovements)
    .groupBy(inventoryMovements.productId)
  const onHandMap = new Map(onHandRows.map((r) => [r.productId, Number(r.onHand)]))

  // Reserved totals from packed orders
  const reservedRows = await db
    .select({
      productId: orderItems.productId,
      reserved: sql<number>`COALESCE(SUM(CAST(${orderItems.quantity} AS FLOAT)), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(eq(orders.status, 'packed'))
    .groupBy(orderItems.productId)
  const reservedMap = new Map(reservedRows.map((r) => [r.productId, Number(r.reserved)]))

  return allProducts.map((p) => {
    const onHand = onHandMap.get(p.id) || 0
    const reserved = reservedMap.get(p.id) || 0
    const available = onHand - reserved
    const reorderLevel = Number(p.reorderLevel)
    return {
      productId: p.id,
      name: p.name,
      unit: p.unit,
      unitPrice: Number(p.unitPrice),
      reorderLevel,
      onHand,
      reserved,
      available,
      value: onHand * Number(p.unitPrice),
      lowStock: available <= reorderLevel && reorderLevel > 0,
    }
  })
}

/** Aggregate inventory value + counts for summary cards. */
export async function getInventorySummary() {
  const status = await getStockStatus()
  return {
    totalProducts: status.length,
    totalOnHand: status.reduce((s, p) => s + p.onHand, 0),
    totalReserved: status.reduce((s, p) => s + p.reserved, 0),
    totalAvailable: status.reduce((s, p) => s + p.available, 0),
    totalValue: status.reduce((s, p) => s + p.value, 0),
    lowStockCount: status.filter((p) => p.lowStock).length,
  }
}

/** Raw movement history, optionally filtered by product. */
export async function getMovements(productId?: number, limit = 100) {
  const base = db
    .select({
      id: inventoryMovements.id,
      productId: inventoryMovements.productId,
      productName: products.name,
      unit: products.unit,
      movementType: inventoryMovements.movementType,
      quantity: inventoryMovements.quantity,
      movementDate: inventoryMovements.movementDate,
      referenceType: inventoryMovements.referenceType,
      notes: inventoryMovements.notes,
    })
    .from(inventoryMovements)
    .leftJoin(products, eq(inventoryMovements.productId, products.id))

  const rows = productId
    ? await base.where(eq(inventoryMovements.productId, productId)).orderBy(desc(inventoryMovements.movementDate), desc(inventoryMovements.id)).limit(limit)
    : await base.orderBy(desc(inventoryMovements.movementDate), desc(inventoryMovements.id)).limit(limit)

  return rows
}

/**
 * Daily report: stock in vs out per day within a month.
 */
export async function getDailyReport(month?: string) {
  const currentMonth = month || new Date().toISOString().slice(0, 7)
  const rows = await db
    .select({
      day: inventoryMovements.movementDate,
      stockIn: sql<number>`COALESCE(SUM(CASE WHEN CAST(${inventoryMovements.quantity} AS FLOAT) > 0 THEN CAST(${inventoryMovements.quantity} AS FLOAT) ELSE 0 END), 0)`,
      stockOut: sql<number>`COALESCE(SUM(CASE WHEN CAST(${inventoryMovements.quantity} AS FLOAT) < 0 THEN -CAST(${inventoryMovements.quantity} AS FLOAT) ELSE 0 END), 0)`,
    })
    .from(inventoryMovements)
    .where(sql`TO_CHAR(${inventoryMovements.movementDate}, 'YYYY-MM') = ${currentMonth}`)
    .groupBy(inventoryMovements.movementDate)
    .orderBy(asc(inventoryMovements.movementDate))

  return rows.map((r) => ({
    day: r.day,
    stockIn: Number(r.stockIn),
    stockOut: Number(r.stockOut),
    net: Number(r.stockIn) - Number(r.stockOut),
  }))
}

/**
 * Monthly report: totals per movement type for the last N months.
 */
export async function getMonthlyReport(monthsBack = 6) {
  const rows = await db
    .select({
      month: sql<string>`TO_CHAR(${inventoryMovements.movementDate}, 'YYYY-MM')`,
      stockIn: sql<number>`COALESCE(SUM(CASE WHEN CAST(${inventoryMovements.quantity} AS FLOAT) > 0 THEN CAST(${inventoryMovements.quantity} AS FLOAT) ELSE 0 END), 0)`,
      stockOut: sql<number>`COALESCE(SUM(CASE WHEN CAST(${inventoryMovements.quantity} AS FLOAT) < 0 THEN -CAST(${inventoryMovements.quantity} AS FLOAT) ELSE 0 END), 0)`,
    })
    .from(inventoryMovements)
    .groupBy(sql`TO_CHAR(${inventoryMovements.movementDate}, 'YYYY-MM')`)
    .orderBy(desc(sql`TO_CHAR(${inventoryMovements.movementDate}, 'YYYY-MM')`))
    .limit(monthsBack)

  return rows
    .map((r) => ({
      month: r.month,
      stockIn: Number(r.stockIn),
      stockOut: Number(r.stockOut),
      net: Number(r.stockIn) - Number(r.stockOut),
    }))
    .reverse()
}
