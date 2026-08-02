'use server'

import { db } from '@/lib/db'
import { user, account } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'

// Simple hash using Web Crypto (available in Node.js/Edge)
async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.hash(password, 10)
}

export async function getUsers() {
  return db.select({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  }).from(user).orderBy(user.createdAt)
}

export async function createUser(data: { name: string; email: string; password: string }) {
  const existing = await db.select().from(user).where(eq(user.email, data.email))
  if (existing.length > 0) {
    throw new Error('A user with this email already exists.')
  }

  const id = `user_${randomBytes(8).toString('hex')}`
  const hashedPassword = await hashPassword(data.password)

  await db.insert(user).values({
    id,
    name: data.name,
    email: data.email,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  await db.insert(account).values({
    id: `account_${randomBytes(8).toString('hex')}`,
    userId: id,
    providerId: 'credential',
    accountId: data.email,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  revalidatePath('/settings')
}

export async function deleteUser(userId: string) {
  await db.delete(user).where(eq(user.id, userId))
  revalidatePath('/settings')
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword)
  await db.update(account)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(account.userId, userId))
  revalidatePath('/settings')
}
