'use client'

import { useState } from 'react'
import { deleteMaidRecord } from '@/app/actions/maid'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface MaidRecord {
  id: number
  date: string | Date
  clockInTime?: string | Date | null
  clockOutTime?: string | Date | null
  clockedInBy: string
  notes?: string | null
}

export function MaidList({ records }: { records: MaidRecord[] }) {
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this record?')) {
      await deleteMaidRecord(id)
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (time: string | Date | null | undefined) => {
    if (!time) return '--'
    
    // If it's a time string in HH:MM format (local time), use it directly
    if (typeof time === 'string' && time.includes(':') && !time.includes('T') && !time.includes('Z')) {
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const isPM = hour >= 12
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${isPM ? 'PM' : 'AM'}`
    }
    
    // Otherwise, parse as ISO date and extract local time without timezone conversion
    const dateObj = typeof time === 'string' ? new Date(time) : time
    const hours = dateObj.getHours()
    const minutes = dateObj.getMinutes()
    const isPM = hours >= 12
    const displayHour = hours % 12 || 12
    const paddedMinutes = minutes.toString().padStart(2, '0')
    return `${displayHour}:${paddedMinutes} ${isPM ? 'PM' : 'AM'}`
  }

  const calculateDuration = (clockIn: string | Date | null | undefined, clockOut: string | Date | null | undefined) => {
    if (!clockIn || !clockOut) return '--'
    
    const inTime = new Date(clockIn).getTime()
    const outTime = new Date(clockOut).getTime()
    const durationMs = outTime - inTime
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  if (records.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-4">No attendance records yet.</p>
        <p className="text-sm text-muted-foreground">
          Maid attendance will be tracked and displayed here.
        </p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-foreground">Attendance Records</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold">Date</th>
              <th className="text-left py-3 px-4 font-semibold">Clock In</th>
              <th className="text-left py-3 px-4 font-semibold">Clock Out</th>
              <th className="text-left py-3 px-4 font-semibold">Duration</th>
              <th className="text-left py-3 px-4 font-semibold">Method</th>
              <th className="text-right py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4 font-medium">{formatDate(record.date)}</td>
                <td className="py-3 px-4">{formatTime(record.clockInTime)}</td>
                <td className="py-3 px-4">{formatTime(record.clockOutTime)}</td>
                <td className="py-3 px-4">{calculateDuration(record.clockInTime, record.clockOutTime)}</td>
                <td className="py-3 px-4">
                  <span className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs capitalize">
                    {record.clockedInBy.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(record.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
