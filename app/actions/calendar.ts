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
          recurringType: recurringBills.recurringType,
          startDate: recurringBills.startDate,
          dayOfMonth: recurringBills.dayOfMonth,
          customDates: recurringBills.customDates,
          isActive: recurringBills.isActive,
        })
        .from(recurringBills)
        .where(sql`${recurringBills.userid} = ${SHARED_USER_ID} AND ${recurringBills.isactive} = true`)
        .orderBy(recurringBills.recurringType),
    ])

    const events: CalendarEvent[] = []

    // Process dues
    duesList.forEach((due: any) => {
      const dateStr = typeof due.date === 'string' ? due.date : due.date?.toISOString().split('T')[0]
      events.push({
        id: `due-${due.id}`,
        title: `Bill: ${due.category || due.description}`,
        start: new Date(`${dateStr}T00:00:00Z`),
        end: new Date(`${dateStr}T23:59:59Z`),
        type: 'due',
        status: due.status,
        amount: due.amount?.toString(),
        description: due.description,
      })
    })

    // Process maid attendance
    maidList.forEach((maid: any) => {
      const dateStr = typeof maid.date === 'string' ? maid.date : maid.date?.toISOString().split('T')[0]
      events.push({
        id: `maid-${maid.id}`,
        title: 'Maid Check-in',
        start: maid.clockInTime ? new Date(maid.clockInTime) : new Date(`${dateStr}T00:00:00Z`),
        end: maid.clockOutTime ? new Date(maid.clockOutTime) : new Date(`${dateStr}T23:59:59Z`),
        type: 'maid',
        description: maid.notes || 'Check-in',
      })
    })

    // Process expenses
    expenseList.forEach((expense: any) => {
      const dateStr = typeof expense.date === 'string' ? expense.date : expense.date?.toISOString().split('T')[0]
      events.push({
        id: `expense-${expense.id}`,
        title: `Expense: ${expense.category}`,
        start: new Date(`${dateStr}T00:00:00Z`),
        end: new Date(`${dateStr}T23:59:59Z`),
        type: 'expense',
        amount: expense.amount?.toString(),
        description: expense.description,
        category: expense.category,
      })
    })

    // Process income
    incomeList.forEach((inc: any) => {
      const dateStr = typeof inc.date === 'string' ? inc.date : inc.date?.toISOString().split('T')[0]
      events.push({
        id: `income-${inc.id}`,
        title: `Income: ${inc.category}`,
        start: new Date(`${dateStr}T00:00:00Z`),
        end: new Date(`${dateStr}T23:59:59Z`),
        type: 'income',
        amount: inc.amount?.toString(),
        description: inc.description,
        category: inc.category,
      })
    })

    // Process recurring bills - generate events based on recurrence type
    recurringList.forEach((bill: any) => {
      if (!bill.isActive) return
      
      const billStartDate = new Date(bill.startDate)
      const recurringType = bill.recurringType || 'monthly'
      
      if (recurringType === 'monthly') {
        // Generate monthly recurring events
        const currentDate = new Date(startDate)
        while (currentDate <= endDate) {
          const year = currentDate.getFullYear()
          const month = currentDate.getMonth()
          
          // Calculate the actual day (handle months with fewer days)
          const lastDay = new Date(year, month + 1, 0).getDate()
          const billDay = Math.min(bill.dayOfMonth || billStartDate.getDate(), lastDay)
          
          const eventDate = new Date(year, month, billDay)
          
          // Only include if within the date range and after start date
          if (eventDate >= startDate && eventDate <= endDate && eventDate >= billStartDate) {
            const dateStr = eventDate.toISOString().split('T')[0]
            events.push({
              id: `recurring-${bill.id}-${year}-${month}-${billDay}`,
              title: `Bill: ${bill.category || bill.description}`,
              start: new Date(`${dateStr}T00:00:00Z`),
              end: new Date(`${dateStr}T23:59:59Z`),
              type: 'due',
              amount: bill.amount?.toString(),
              description: bill.description,
            })
          }
          
          currentDate.setMonth(currentDate.getMonth() + 1)
        }
      } else if (recurringType === 'weekly') {
        // Generate weekly recurring events (every 7 days from start date)
        let currentDate = new Date(billStartDate)
        while (currentDate <= endDate) {
          if (currentDate >= startDate) {
            const dateStr = currentDate.toISOString().split('T')[0]
            events.push({
              id: `recurring-${bill.id}-${dateStr}`,
              title: `Bill: ${bill.category || bill.description}`,
              start: new Date(`${dateStr}T00:00:00Z`),
              end: new Date(`${dateStr}T23:59:59Z`),
              type: 'due',
              amount: bill.amount?.toString(),
              description: bill.description,
            })
          }
          currentDate.setDate(currentDate.getDate() + 7)
        }
      } else if (recurringType === 'biweekly') {
        // Generate biweekly recurring events (every 14 days from start date)
        let currentDate = new Date(billStartDate)
        while (currentDate <= endDate) {
          if (currentDate >= startDate) {
            const dateStr = currentDate.toISOString().split('T')[0]
            events.push({
              id: `recurring-${bill.id}-${dateStr}`,
              title: `Bill: ${bill.category || bill.description}`,
              start: new Date(`${dateStr}T00:00:00Z`),
              end: new Date(`${dateStr}T23:59:59Z`),
              type: 'due',
              amount: bill.amount?.toString(),
              description: bill.description,
            })
          }
          currentDate.setDate(currentDate.getDate() + 14)
        }
      } else if (recurringType === 'custom' && bill.customDates) {
        // Generate events for custom dates
        try {
          const customDates = JSON.parse(bill.customDates)
          customDates.forEach((dateStr: string) => {
            const eventDate = new Date(dateStr)
            if (eventDate >= startDate && eventDate <= endDate) {
              events.push({
                id: `recurring-${bill.id}-${dateStr}`,
                title: `Bill: ${bill.category || bill.description}`,
                start: new Date(`${dateStr}T00:00:00Z`),
                end: new Date(`${dateStr}T23:59:59Z`),
                type: 'due',
                amount: bill.amount?.toString(),
                description: bill.description,
              })
            }
          })
        } catch (e) {
          console.error('[v0] Failed to parse custom dates for bill', bill.id)
        }
      }
    })

    return events
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }
}
