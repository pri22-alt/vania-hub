import { pgTable, text, timestamp, boolean, serial, decimal, date, varchar, integer } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailverified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresat').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
  ipAddress: text('ipaddress'),
  userAgent: text('useragent'),
  userId: text('userid')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountid').notNull(),
  providerId: text('providerid').notNull(),
  userId: text('userid')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accesstoken'),
  refreshToken: text('refreshtoken'),
  idToken: text('idtoken'),
  accessTokenExpiresAt: timestamp('accesstokenexpiresat'),
  refreshTokenExpiresAt: timestamp('refreshtokenexpiresat'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresat').notNull(),
  createdAt: timestamp('createdat').defaultNow(),
  updatedAt: timestamp('updatedat').defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Add your app tables below. Always include a plain `userId` column so queries
// can be scoped per user — the security model depends on this column existing,
// not on a foreign key. Do NOT add a foreign key constraint
// (`.references(() => user.id, ...)`) unless the user explicitly asks for
// foreign keys or referential integrity; FK constraints make iterating on the
// schema harder.
//
// Vania Hub App Tables

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  userId: text('userid').notNull(),
  date: date('date').notNull(),
  description: text('description').notNull(),
  categoryType: varchar('categorytype', { length: 20 }).notNull().default('household'), // 'household' or 'business'
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar('paymentmethod', { length: 20 }).notNull(),
  googleFormsLink: text('googleformslink'),
  remarks: text('remarks'),
  notes: text('notes'),
  driveFileId: text('drivefileid'), // Google Drive file ID
  driveFileUrl: text('drivefileurl'), // Google Drive file link
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const income = pgTable('income', {
  id: serial('id').primaryKey(),
  userId: text('userid').notNull(),
  date: date('date').notNull(),
  description: text('description').notNull(),
  categoryType: varchar('categorytype', { length: 20 }).notNull().default('household'), // 'household' or 'business'
  category: text('category').notNull().default('salary'),
  subcategory: text('subcategory'),
  customSubcategory: text('customsubcategory'), // For "Other" subcategory custom text
  clientId: integer('clientid'), // For Cheese Sales - links to virmanis_clients
  clientName: text('clientname'), // Direct client name for Cheese Sales
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  source: varchar('source', { length: 50 }),
  remarks: text('remarks'),
  notes: text('notes'),
  driveFileId: text('drivefileid'), // Google Drive file ID
  driveFileUrl: text('drivefileurl'), // Google Drive file link
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const dues = pgTable('dues', {
  id: serial('id').primaryKey(),
  userId: text('userid').notNull(),
  date: date('date').notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  paidDate: date('paiddate'),
  category: text('category'),
  notes: text('notes'),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const maidAttendance = pgTable('maid_attendance', {
  id: serial('id').primaryKey(),
  userId: text('userid').notNull(),
  date: date('date').notNull(),
  clockInTime: timestamp('clockintime'),
  clockOutTime: timestamp('clockouttime'),
  clockedInBy: varchar('clockedinby', { length: 20 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const virmanisSales = pgTable('virmanis_sales', {
  id: serial('id').primaryKey(),
  userId: text('userid').notNull(),
  date: date('date').notNull(),
  customerName: text('customername').notNull(),
  productName: text('productname').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal('unitprice', { precision: 12, scale: 2 }).notNull(),
  totalAmount: decimal('totalamount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar('paymentmethod', { length: 20 }).notNull(),
  remarks: text('remarks'),
  notes: text('notes'),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const budgetLimits = pgTable('budget_limits', {
  id: serial('id').primaryKey(),
  userId: text('userid').notNull(),
  category: text('category').notNull(),
  monthYear: varchar('monthyear', { length: 10 }).notNull(),
  limitAmount: decimal('limitamount', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const recurringBills = pgTable('recurring_bills', {
  id: serial('id').primaryKey(),
  userId: text('userid').notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  category: text('category').notNull(),
  dayOfMonth: integer('dayofmonth').notNull(),
  isActive: boolean('isactive').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const virmaisClients = pgTable('virmanis_clients', {
  id: serial('id').primaryKey(),
  userId: text('userid').notNull(),
  clientName: text('clientname').notNull(),
  contactPerson: text('contactperson'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  purchaseFrequency: varchar('purchasefrequency', { length: 50 }), // e.g., "Weekly", "Bi-weekly", "Monthly"
  totalSpent: decimal('totalspent', { precision: 12, scale: 2 }).notNull().default('0'),
  lastPurchaseDate: date('lastpurchasedate'),
  notes: text('notes'),
  isActive: boolean('isactive').notNull().default(true),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const companySettings = pgTable('company_settings', {
  id: serial('id').primaryKey(),
  userId: text('userid').notNull(),
  companyName: text('companyname').notNull(),
  companyEmail: text('companyemail'),
  companyPhone: text('companyphone'),
  companyAddress: text('companyaddress'),
  companyCity: text('companycity'),
  companyCountry: text('companycountry'),
  logoUrl: text('logourl'),
  logoDriveId: text('logodriveid'), // Google Drive file ID for logo
  taxRate: decimal('taxrate', { precision: 5, scale: 2 }).default('0'), // Tax percentage
  bankDetails: text('bankdetails'), // Bank account info for invoices
  notes: text('notes'),
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  userId: text('userid').notNull(),
  invoiceNumber: varchar('invoicenumber', { length: 50 }).notNull().unique(), // e.g., INV-2026-001
  clientId: integer('clientid').notNull(),
  clientName: text('clientname').notNull(),
  clientEmail: text('clientemail'),
  clientPhone: text('clientphone'),
  clientAddress: text('clientaddress'),
  invoiceDate: date('invoicedate').notNull(),
  dueDate: date('duedate'),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal('taxamount', { precision: 12, scale: 2 }).notNull().default('0'),
  totalAmount: decimal('totalamount', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, sent, paid
  notes: text('notes'),
  driveFileId: text('drivefileid'), // Google Drive PDF file ID
  driveFileUrl: text('drivefileurl'), // Google Drive PDF link
  createdAt: timestamp('createdat').notNull().defaultNow(),
  updatedAt: timestamp('updatedat').notNull().defaultNow(),
})

export const invoiceLineItems = pgTable('invoice_line_items', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoiceid').notNull(),
  description: text('description').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal('unitprice', { precision: 12, scale: 2 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('createdat').notNull().defaultNow(),
})


