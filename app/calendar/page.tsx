export const dynamic = 'force-dynamic'

import { getCalendarEvents } from '@/app/actions/calendar'
import { CalendarViewComponent } from '@/components/calendar-view'
import { addMonths, subMonths } from 'date-fns'

export default async function CalendarPage() {
  const today = new Date()
  const startDate = subMonths(today, 1)
  const endDate = addMonths(today, 3)

  const events = await getCalendarEvents(startDate, endDate)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Calendar View</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Track dues, bills, maid check-ins, expenses, and income all in one place
        </p>
      </div>

      <CalendarViewComponent events={events} />
    </div>
  )
}
