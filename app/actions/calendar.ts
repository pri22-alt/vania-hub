'use server'

import { db } from '@/lib/db'
import { dues, maidAttendance, expenses, income, recurringBills } from '@/lib/db/schema'
import { sql, eq } from 'drizzle-orm'

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
  try {
    const [duesList, maidList, expenseList, incomeList, recurringList] = await Promise.all([
      db
        .select({
          id: sql`CAST(${dues.id} AS TEXT)`,
          date: dues.date,
          description: dues.description,
          status: dues.status,
          amount: dues.amount,
          category: dues.category,
        })
        .from(dues)
        .where(sql`${dues.userid} = ${SHARED_USER_ID} AND ${dues.date} BETWEEN ${startDate.toISOString().split('T')[0]} AND ${endDate.toISOString().split('T')[0]}`)
        .orderBy(dues.date),

      db
        .select({
          id: sql`CAST(${maidAttendance.id} AS TEXT)`,
          date: maidAttendance.date,
          clockInTime: maidAttendance.clockInTime,
          clockOutTime: maidAttendance.clockOutTime,
          notes: maidAttendance.notes,
        })
        .from(maidAttendance)
        .where(sql`${maidAttendance.userid} = ${SHARED_USER_ID} AND ${maidAttendance.date} BETWEEN ${startDate.toISOString().split('T')[0]} AND ${endDate.toISOString().split('T')[0]}`)
        .orderBy(maidAttendance.date),

      db
        .select({
          id: sql`CAST(${expenses.id} AS TEXT)`,
          date: expenses.date,
          description: expenses.description,
          amount: expenses.amount,
          category: expenses.category,
        })
        .from(expenses)
        .where(sql`${expenses.userid} = ${SHARED_USER_ID} AND ${expenses.date} BETWEEN ${startDate.toISOString().split('T')[0]} AND ${endDate.toISOString().split('T')[0]}`)
        .orderBy(expenses.date),

      db
        .select({
          id: sql`CAST(${income.id} AS TEXT)`,
          date: income.date,
          description: income.description,
          amount: income.amount,
          category: income.category,
        })
        .from(income)
        .where(sql`${income.userid} = ${SHARED_USER_ID} AND ${income.date} BETWEEN ${startDate.toISOString().split('T')[0]} AND ${endDate.toISOString().split('T')[0]}`)
        .orderBy(income.date),

      db
        .select({
          id: sql`CAST(${recurringBills.id} AS TEXT)`,
          description: recurringBills.description,
          amount: recurringBills.amount,
          category: recurringBills.category,
          dayOfMonth: recurringBills.dayOfMonth,
          isActive: recurringBills.isActive,
        })
        .from(recurringBills)
        .where(sql`${recurringBills.userid} = ${SHARED_USER_ID} AND ${recurringBills.isactive} = true`)
        .orderBy(recurringBills.dayOfMonth),
    ])

    const events: CalendarEvent[] = []

    // Process dues
    duesList.forEach((due: any) => {
      events.push({
        id: `due-${due.id}`,
        title: `Bill: ${due.category || due.description}`,
        start: new Date(`${due.date}T00:00:00`),
        end: new Date(`${due.date}T23:59:59`),
        type: 'due',
        status: due.status,
        amount: due.amount?.toString(),
        description: due.description,
      })
    })

    // Process maid attendance
    maidList.forEach((maid: any) => {
      events.push({
        id: `maid-${maid.id}`,
        title: 'Maid Check-in',
        start: maid.clockInTime ? new Date(maid.clockInTime) : new Date(`${maid.date}T00:00:00`),
        end: maid.clockOutTime ? new Date(maid.clockOutTime) : new Date(`${maid.date}T23:59:59`),
        type: 'maid',
        description: maid.notes || 'Check-in',
      })
    })

    // Process expenses
    expenseList.forEach((expense: any) => {
      events.push({
        id: `expense-${expense.id}`,
        title: `Expense: ${expense.category}`,
        start: new Date(`${expense.date}T00:00:00`),
        end: new Date(`${expense.date}T23:59:59`),
        type: 'expense',
        amount: expense.amount?.toString(),
        description: expense.description,
        category: expense.category,
      })
    })

    // Process income
    incomeList.forEach((inc: any) => {
      events.push({
        id: `income-${inc.id}`,
        title: `Income: ${inc.category}`,
        start: new Date(`${inc.date}T00:00:00`),
        end: new Date(`${inc.date}T23:59:59`),
        type: 'income',
        amount: inc.amount?.toString(),
        description: inc.description,
        category: inc.category,
      })
    })

    // Process recurring bills - generate events for each month in the date range
    recurringList.forEach((bill: any) => {
      if (!bill.isActive) return
      
      // Generate recurring bill events for each month in the range
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        
        // Calculate the actual day (handle months with fewer days)
        const lastDay = new Date(year, month + 1, 0).getDate()
        const billDay = Math.min(bill.dayOfMonth, lastDay)
        
        const eventDate = new Date(year, month, billDay)
        
        // Only include if within the date range
        if (eventDate >= startDate && eventDate <= endDate) {
          events.push({
            id: `recurring-${bill.id}-${year}-${month}-${billDay}`,
            title: `Bill: ${bill.category || bill.description}`,
            start: new Date(`${eventDate.toISOString().split('T')[0]}T00:00:00`),
            end: new Date(`${eventDate.toISOString().split('T')[0]}T23:59:59`),
            type: 'due',
            amount: bill.amount?.toString(),
            description: bill.description,
          })
        }
        
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
    })

    return events
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }
}
