import { pgTable, text, timestamp, boolean, serial, decimal, date, varchar } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
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
