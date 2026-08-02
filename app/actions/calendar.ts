'use server'

import { db } from '@/lib/db'
import { dues, maidAttendance, expenses, income, recurringBills } from '@/lib/db/schema'
import { and, eq, gte, lte, sql } from 'drizzle-orm'

const SHARED_USER_ID = 'family-hub'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'due' | 'maid' | 'expense' | 'income'
  status?: string
  amount?: string
  description?: string
  category?: string
}

export async function getCalendarEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
  const startStr = startDate.toISOString().split('T')[0]
  const endStr = endDate.toISOString().split('T')[0]

  try {
    const [duesList, maidList, expenseList, incomeList, recurringList] = await Promise.all([
      // Dues
      db
        .select({
          id: dues.id,
          date: dues.date,
          description: dues.description,
          status: dues.status,
          amount: dues.amount,
          category: dues.category,
        })
        .from(dues)
        .where(
          and(
            eq(dues.userId, SHARED_USER_ID),
            gte(dues.date, startStr),
            lte(dues.date, endStr),
          )
        )
        .orderBy(dues.date),

      // Maid attendance
      db
        .select({
          id: maidAttendance.id,
          date: maidAttendance.date,
          clockInTime: maidAttendance.clockInTime,
          clockOutTime: maidAttendance.clockOutTime,
          notes: maidAttendance.notes,
        })
        .from(maidAttendance)
        .where(
          and(
            eq(maidAttendance.userId, SHARED_USER_ID),
            gte(maidAttendance.date, startStr),
            lte(maidAttendance.date, endStr),
          )
        )
        .orderBy(maidAttendance.date),

      // Expenses
      db
        .select({
          id: expenses.id,
          date: expenses.date,
          description: expenses.description,
          amount: expenses.amount,
          category: expenses.category,
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.userId, SHARED_USER_ID),
            gte(expenses.date, startStr),
            lte(expenses.date, endStr),
          )
        )
        .orderBy(expenses.date),

      // Income
      db
        .select({
          id: income.id,
          date: income.date,
          description: income.description,
          amount: income.amount,
          category: income.category,
        })
        .from(income)
        .where(
          and(
            eq(income.userId, SHARED_USER_ID),
            gte(income.date, startStr),
            lte(income.date, endStr),
          )
        )
        .orderBy(income.date),

      // Recurring bills (no date filter — generate occurrences below)
      db
        .select({
          id: recurringBills.id,
          description: recurringBills.description,
          amount: recurringBills.amount,
          category: recurringBills.category,
          dayOfMonth: recurringBills.dayOfMonth,
          isActive: recurringBills.isActive,
        })
        .from(recurringBills)
        .where(
          and(
            eq(recurringBills.userId, SHARED_USER_ID),
            eq(recurringBills.isActive, true),
          )
        )
        .orderBy(recurringBills.dayOfMonth),
    ])

    const events: CalendarEvent[] = []

    // Parse a date string ("YYYY-MM-DD") into midnight local time
    const parseDate = (dateStr: string): Date => {
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day)
    }

    // Dues
    duesList.forEach((due) => {
      const dateStr = typeof due.date === 'string' ? due.date : (due.date as any)?.toISOString?.().split('T')[0]
      if (!dateStr) return
      const d = parseDate(dateStr)
      events.push({
        id: `due-${due.id}`,
        title: `Bill Due: ${due.category || due.description}`,
        start: d,
        end: d,
        type: 'due',
        status: due.status,
        amount: due.amount?.toString(),
        description: due.description,
      })
    })

    // Maid attendance
    maidList.forEach((maid) => {
      const dateStr = typeof maid.date === 'string' ? maid.date : (maid.date as any)?.toISOString?.().split('T')[0]
      if (!dateStr) return
      const d = parseDate(dateStr)
      events.push({
        id: `maid-${maid.id}`,
        title: 'Maid Check-in',
        start: maid.clockInTime ? new Date(maid.clockInTime) : d,
        end: maid.clockOutTime ? new Date(maid.clockOutTime) : d,
        type: 'maid',
        description: maid.notes || 'Maid attendance',
      })
    })

    // Expenses
    expenseList.forEach((expense) => {
      const dateStr = typeof expense.date === 'string' ? expense.date : (expense.date as any)?.toISOString?.().split('T')[0]
      if (!dateStr) return
      const d = parseDate(dateStr)
      events.push({
        id: `expense-${expense.id}`,
        title: `Expense: ${expense.category}`,
        start: d,
        end: d,
        type: 'expense',
        amount: expense.amount?.toString(),
        description: expense.description,
        category: expense.category,
      })
    })

    // Income
    incomeList.forEach((inc) => {
      const dateStr = typeof inc.date === 'string' ? inc.date : (inc.date as any)?.toISOString?.().split('T')[0]
      if (!dateStr) return
      const d = parseDate(dateStr)
      events.push({
        id: `income-${inc.id}`,
        title: `Income: ${inc.category}`,
        start: d,
        end: d,
        type: 'income',
        amount: inc.amount?.toString(),
        description: inc.description,
        category: inc.category,
      })
    })

    // Recurring bills — generate one event per month across the range
    recurringList.forEach((bill) => {
      if (!bill.isActive) return
      const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      const rangeEnd = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0)
      while (cursor <= rangeEnd) {
        const year = cursor.getFullYear()
        const month = cursor.getMonth()
        const lastDay = new Date(year, month + 1, 0).getDate()
        const day = Math.min(bill.dayOfMonth, lastDay)
        const eventDate = new Date(year, month, day)
        if (eventDate >= new Date(startDate.getFullYear(), startDate.getMonth(), 1) &&
            eventDate <= rangeEnd) {
          events.push({
            id: `recurring-${bill.id}-${year}-${month}-${day}`,
            title: `Bill Due: ${bill.category || bill.description}`,
            start: eventDate,
            end: eventDate,
            type: 'due',
            amount: bill.amount?.toString(),
            description: `${bill.description} (recurring)`,
          })
        }
        cursor.setMonth(cursor.getMonth() + 1)
      }
    })

    return events
  } catch (error) {
    console.error('[v0] Error fetching calendar events:', error)
    return []
  }
}
