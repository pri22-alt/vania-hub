'use client'

import { useState, useMemo } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CalendarEvent } from '@/app/actions/calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Set Malaysia timezone (UTC+8)
moment.tz.setDefault('Asia/Kuala_Lumpur')

const localizer = momentLocalizer(moment)

interface CalendarViewProps {
  events: CalendarEvent[]
}

const eventStyleGetter = (event: CalendarEvent) => {
  let backgroundColor = '#6366f1' // default indigo
  let borderColor = '#4f46e5'

  if (event.type === 'due') {
    backgroundColor = event.status === 'paid' ? '#10b981' : '#ef4444'
    borderColor = event.status === 'paid' ? '#059669' : '#dc2626'
  } else if (event.type === 'maid') {
    backgroundColor = '#f59e0b'
    borderColor = '#d97706'
  } else if (event.type === 'expense') {
    backgroundColor = '#ec4899'
    borderColor = '#be185d'
  } else if (event.type === 'income') {
    backgroundColor = '#10b981'
    borderColor = '#059669'
  }

  return {
    style: {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: `2px solid ${borderColor}`,
      display: 'block',
      fontSize: '12px',
    },
  }
}

const CustomEventComponent = ({ event }: { event: CalendarEvent }) => (
  <div className="p-1">
    <div className="font-semibold text-xs truncate">{event.title}</div>
    {event.amount && <div className="text-xs">{event.amount}</div>}
  </div>
)

export function CalendarViewComponent({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)

  const filteredEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.start >= monthStart &&
          event.start <= monthEnd,
      ),
    [events, monthStart, monthEnd],
  )

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const handleToday = () => setCurrentDate(new Date())

  const typeColors = {
    due: 'bg-red-100 text-red-800',
    maid: 'bg-amber-100 text-amber-800',
    expense: 'bg-pink-100 text-pink-800',
    income: 'bg-green-100 text-green-800',
  }

  const typeBadges = {
    due: 'Bill/Due',
    maid: 'Maid',
    expense: 'Expense',
    income: 'Income',
  }

  return (
    <div className="w-full space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-3 bg-card border border-border rounded-lg">
        {Object.entries(typeBadges).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${typeColors[type as keyof typeof typeColors]}`}></div>
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
        <Button variant="outline" size="sm" onClick={handlePrevMonth}>
          ← Previous
        </Button>
        <h2 className="text-lg font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            Next →
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4 overflow-hidden">
        <div className="bg-white rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            components={{
              event: CustomEventComponent,
            }}
            view="month"
            views={['month']}
            toolbar={false}
            popup
            selectable
            onSelectEvent={(event) => setSelectedEvent(event)}
          />
        </div>
      </Card>

      {/* Event Details */}
      {selectedEvent && (
        <Card className="p-4 border-2 border-primary">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{format(selectedEvent.start, 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${typeColors[selectedEvent.type]}`}>
                  {typeBadges[selectedEvent.type]}
                </span>
              </div>

              {selectedEvent.amount && (
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium text-base">RM {parseFloat(selectedEvent.amount).toFixed(2)}</p>
                </div>
              )}

              {selectedEvent.status && (
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${selectedEvent.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {selectedEvent.status}
                  </span>
                </div>
              )}
            </div>

            {selectedEvent.description && (
              <div>
                <p className="text-muted-foreground text-sm">Details</p>
                <p className="text-foreground">{selectedEvent.description}</p>
              </div>
            )}

            {selectedEvent.category && selectedEvent.type !== 'due' && (
              <div>
                <p className="text-muted-foreground text-sm">Category</p>
                <p className="text-foreground">{selectedEvent.category}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Events Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(typeBadges).map(([type, label]) => {
          const typeEvents = filteredEvents.filter((e) => e.type === type as CalendarEvent['type'])
          const totalAmount = typeEvents.reduce((sum, e) => sum + (parseFloat(e.amount || '0') || 0), 0)
          return (
            <Card key={type} className="p-4">
              <div className="text-sm text-muted-foreground mb-1">{label}</div>
              <div className="text-2xl font-bold mb-1">{typeEvents.length}</div>
              {totalAmount > 0 && <div className="text-xs text-muted-foreground">RM {totalAmount.toFixed(2)}</div>}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
