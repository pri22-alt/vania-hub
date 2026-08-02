'use client'

import { useState } from 'react'
import { deleteRecurringBill, toggleRecurringBill } from '@/app/actions/recurring-bills'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatRM } from '@/lib/utils/currency'

export interface RecurringBill {
  id: number
  description: string
  amount: string | number
  category: string
  dayOfMonth: number
  isActive: boolean
  notes?: string | null
}

export function RecurringBillsList({ bills }: { bills: RecurringBill[] }) {
  const [deleting, setDeleting] = useState<number | null>(null)

  const handleToggle = async (id: number, isActive: boolean) => {
    await toggleRecurringBill(id, !isActive)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this recurring bill?')) {
      setDeleting(id)
      await deleteRecurringBill(id)
      setDeleting(null)
    }
  }

  if (bills.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No recurring bills set up yet</p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Recurring Monthly Bills</h3>
        <p className="text-xs text-muted-foreground">These bills will automatically be tracked each month</p>
      </div>

      <div className="space-y-3">
        {bills.map((bill) => (
          <Card key={bill.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={bill.isActive}
                    onChange={() => handleToggle(bill.id, bill.isActive)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <h4 className={`font-medium ${!bill.isActive ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {bill.description}
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm ml-6">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-semibold text-amber-600">{formatRM(Number(bill.amount))}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Day</p>
                    <p className="font-semibold">{bill.dayOfMonth}th of each month</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Category</p>
                    <p className="text-sm">{bill.category}</p>
                  </div>
                  {bill.notes && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs">Notes</p>
                      <p className="text-xs text-foreground">{bill.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(bill.id)}
                  disabled={deleting === bill.id}
                  className="text-xs"
                >
                  {deleting === bill.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
