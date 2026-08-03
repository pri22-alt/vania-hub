'use server'

import { db } from '@/lib/db'
import { invoices, invoiceLineItems, companySettings, orders, orderItems } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const SHARED_USER_ID = 'family-hub'

export async function getCompanySettings() {
  const settings = await db
    .select()
    .from(companySettings)
    .where(eq(companySettings.userId, SHARED_USER_ID))
    .limit(1)

  return settings[0] || null
}

export async function updateCompanySettings(data: {
  companyName?: string
  companyEmail?: string
  companyPhone?: string
  companyAddress?: string
  companyCity?: string
  companyCountry?: string
  logoUrl?: string
  logoDriveId?: string
  taxRate?: string
  bankDetails?: string
  notes?: string
}) {
  const existing = await getCompanySettings()

  if (existing) {
    await db
      .update(companySettings)
      .set(data)
      .where(eq(companySettings.userId, SHARED_USER_ID))
  } else {
    await db.insert(companySettings).values({
      userId: SHARED_USER_ID,
      companyName: data.companyName || 'Virmanis United',
      companyEmail: data.companyEmail || null,
      companyPhone: data.companyPhone || null,
      companyAddress: data.companyAddress || null,
      companyCity: data.companyCity || null,
      companyCountry: data.companyCountry || null,
      logoUrl: data.logoUrl || null,
      logoDriveId: data.logoDriveId || null,
      taxRate: data.taxRate || null,
      bankDetails: data.bankDetails || null,
      notes: data.notes || null,
    })
  }
  revalidatePath('/virmanis')
}

export async function getNextInvoiceNumber() {
  const lastInvoice = await db
    .select()
    .from(invoices)
    .where(eq(invoices.userId, SHARED_USER_ID))
    .orderBy(desc(invoices.id))
    .limit(1)

  if (!lastInvoice || lastInvoice.length === 0) {
    return `INV-${new Date().getFullYear()}-001`
  }

  const lastNum = lastInvoice[0].invoiceNumber
  const parts = lastNum.split('-')
  const year = new Date().getFullYear().toString()

  if (parts[1] !== year) {
    return `INV-${year}-001`
  }

  const num = parseInt(parts[2]) + 1
  return `INV-${year}-${num.toString().padStart(3, '0')}`
}

export async function createInvoice(data: {
  clientId: number
  clientName: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: string
  invoiceDate: string
  dueDate?: string
  subtotal: string
  taxAmount: string
  totalAmount: string
  notes?: string
  lineItems: Array<{
    description: string
    quantity: string
    unitPrice: string
    amount: string
  }>
}) {
  const invoiceNumber = await getNextInvoiceNumber()

  const [newInvoice] = await db
    .insert(invoices)
    .values({
      userId: SHARED_USER_ID,
      invoiceNumber,
      clientId: data.clientId,
      clientName: data.clientName,
      clientEmail: data.clientEmail || null,
      clientPhone: data.clientPhone || null,
      clientAddress: data.clientAddress || null,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate || null,
      subtotal: data.subtotal,
      taxAmount: data.taxAmount,
      totalAmount: data.totalAmount,
      notes: data.notes || null,
    })
    .returning()

  // Insert line items
  for (const item of data.lineItems) {
    await db.insert(invoiceLineItems).values({
      invoiceId: newInvoice.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
    })
  }

  revalidatePath('/virmanis')
  return newInvoice
}

export async function getInvoices() {
  const allInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.userId, SHARED_USER_ID))
    .orderBy(desc(invoices.id))

  return allInvoices
}

export async function getInvoiceWithLineItems(invoiceId: number) {
  const invoice = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, SHARED_USER_ID)))
    .limit(1)

  if (!invoice || invoice.length === 0) return null

  const items = await db
    .select()
    .from(invoiceLineItems)
    .where(eq(invoiceLineItems.invoiceId, invoiceId))

  return {
    ...invoice[0],
    lineItems: items,
  }
}

export async function updateInvoiceStatus(invoiceId: number, status: string) {
  await db
    .update(invoices)
    .set({ status })
    .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, SHARED_USER_ID)))

  revalidatePath('/virmanis')
}

export async function updateInvoiceDriveLink(invoiceId: number, driveFileId: string, driveFileUrl: string) {
  await db
    .update(invoices)
    .set({ driveFileId, driveFileUrl })
    .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, SHARED_USER_ID)))

  revalidatePath('/virmanis')
}

export async function deleteInvoice(invoiceId: number) {
  await db.delete(invoices).where(eq(invoices.id, invoiceId))
  revalidatePath('/virmanis')
}

// Create invoice from an order (auto-populate line items)
export async function createInvoiceFromOrder(orderId: number) {
  // Get order
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!order[0]) throw new Error('Order not found')

  // Get order items
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))

  // Prepare line items for invoice
  const lineItems = items.map(item => ({
    description: item.productName,
    quantity: item.quantity.toString(),
    unitPrice: item.unitPrice.toString(),
    amount: item.amount.toString(),
  }))

  // Create invoice with order data
  const invoiceData = {
    clientId: order[0].clientId || 0,
    clientName: order[0].clientName,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days default
    subtotal: order[0].total.toString(),
    taxAmount: '0',
    totalAmount: order[0].total.toString(),
    notes: `Generated from Order: ${order[0].orderNumber}`,
    lineItems,
  }

  const newInvoice = await createInvoice(invoiceData)

  // Link invoice to order
  await db
    .update(orders)
    .set({ invoiceId: newInvoice.id })
    .where(eq(orders.id, orderId))

  revalidatePath('/virmanis')
  return newInvoice
}
