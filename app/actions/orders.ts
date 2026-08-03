'use server'

import { db } from '@/lib/db'
import { orders, orderItems, inventoryMovements, products } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { addVirmanisSale } from './virmanis'

const SHARED_USER_ID = 'family-hub'

export async function createOrder(clientName: string, clientId?: number, items: Array<{ productId: number; productName: string; quantity: number; unitPrice: number }>, notes?: string) {
  // Generate order number (ORD-YYYYMMDD-XXXXX)
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '')
  const random = Math.floor(Math.random() * 10000)
  const orderNumber = `ORD-${dateStr}-${random.toString().padStart(5, '0')}`

  // Calculate total
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  // Insert order
  const [order] = await db
    .insert(orders)
    .values({
      userId: SHARED_USER_ID,
      orderNumber,
      clientName,
      clientId: clientId || null,
      status: 'new',
      orderDate: now.toISOString().split('T')[0],
      total,
      notes: notes || null,
    })
    .returning()

  // Insert order items
  for (const item of items) {
    await db.insert(orderItems).values({
      orderId: order.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.quantity * item.unitPrice,
    })
  }

  revalidatePath('/virmanis')
  return order
}

export async function packOrder(orderId: number) {
  // Move to packed status and reserve stock
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))

  if (!order) throw new Error('Order not found')

  // Get order items
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId))

  // Record inventory movements as reserved (negative quantity with 'packed' reference type)
  for (const item of items) {
    await db.insert(inventoryMovements).values({
      userId: SHARED_USER_ID,
      productId: item.productId,
      movementType: 'sale',
      quantity: -item.quantity, // Negative = stock out
      movementDate: new Date().toISOString().split('T')[0],
      referenceType: 'order',
      referenceId: orderId,
      notes: `Packed for order ${order.orderNumber}`,
    })
  }

  // Update order status
  await db
    .update(orders)
    .set({
      status: 'packed',
      packedAt: new Date(),
    })
    .where(eq(orders.id, orderId))

  revalidatePath('/virmanis')
  return { success: true }
}

export async function completeOrder(orderId: number, invoiceId?: number, saleId?: number) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))

  if (!order) throw new Error('Order not found')

  // Update order status and link invoice/sale
  await db
    .update(orders)
    .set({
      status: 'completed',
      completedAt: new Date(),
      invoiceId: invoiceId || null,
      saleId: saleId || null,
    })
    .where(eq(orders.id, orderId))

  revalidatePath('/virmanis')
  return { success: true }
}

export async function cancelOrder(orderId: number) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))

  if (!order) throw new Error('Order not found')

  // If packed, release reserved stock by reversing the movements
  if (order.status === 'packed') {
    const movements = await db
      .select()
      .from(inventoryMovements)
      .where(and(eq(inventoryMovements.referenceType, 'order'), eq(inventoryMovements.referenceId, orderId)))

    for (const movement of movements) {
      // Insert reverse movement to release stock
      await db.insert(inventoryMovements).values({
        userId: SHARED_USER_ID,
        productId: movement.productId,
        movementType: 'adjustment',
        quantity: -movement.quantity, // Reverse the negative
        movementDate: new Date().toISOString().split('T')[0],
        referenceType: 'order',
        referenceId: orderId,
        notes: `Cancelled order ${order.orderNumber}`,
      })
    }
  }

  // Update order status
  await db
    .update(orders)
    .set({
      status: 'cancelled',
    })
    .where(eq(orders.id, orderId))

  revalidatePath('/virmanis')
  return { success: true }
}

export async function getOrders(status?: string) {
  let query = db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      clientName: orders.clientName,
      status: orders.status,
      orderDate: orders.orderDate,
      total: orders.total,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, SHARED_USER_ID))

  if (status) {
    query = query.where(eq(orders.status, status))
  }

  const result = await query.orderBy(desc(orders.createdAt))
  return result
}

export async function getOrderDetail(orderId: number) {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, SHARED_USER_ID)))

  if (!order) return null

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))

  return {
    ...order,
    items,
  }
}

// Quick sale: creates auto-completed order, deducts inventory, and records sale
export async function createQuickSale(data: {
  date: string
  customerName: string
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  paymentMethod: string
  remarks?: string
  notes?: string
}) {
  const now = new Date()
  
  // Create auto-completed order
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '')
  const random = Math.floor(Math.random() * 10000)
  const orderNumber = `ORD-${dateStr}-${random.toString().padStart(5, '0')}`

  const [order] = await db
    .insert(orders)
    .values({
      userId: SHARED_USER_ID,
      orderNumber,
      clientName: data.customerName,
      status: 'completed',
      orderDate: data.date,
      total: data.totalAmount,
      completedAt: now,
      notes: data.notes || null,
    })
    .returning()

  // Insert order item
  await db.insert(orderItems).values({
    orderId: order.id,
    productId: data.productId,
    productName: data.productName,
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    amount: data.totalAmount,
  })

  // Deduct inventory
  await db.insert(inventoryMovements).values({
    userId: SHARED_USER_ID,
    productId: data.productId,
    movementType: 'sale',
    quantity: -data.quantity,
    movementDate: data.date,
    referenceType: 'order',
    referenceId: order.id,
    notes: `Quick sale to ${data.customerName}`,
  })

  // Record sale in virmanis_sales
  await addVirmanisSale({
    date: data.date,
    customerName: data.customerName,
    productName: data.productName,
    quantity: data.quantity.toString(),
    unitPrice: data.unitPrice.toString(),
    totalAmount: data.totalAmount.toString(),
    paymentMethod: data.paymentMethod as any,
    remarks: data.remarks || '',
    notes: `Order: ${orderNumber}`,
  })

  revalidatePath('/virmanis')
  revalidatePath('/inventory')
  return order
}
