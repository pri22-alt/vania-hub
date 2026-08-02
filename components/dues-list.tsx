'use client'

import { useState } from 'react'
import { deleteDue, markDueAsPaid } from '@/app/actions/dues'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface Due {
  id: number
  date: string | Date
  description: string
  amount: string | number
  status: string
  paidDate?: string | null
  category?: string | null
  notes?: string | null
}

export function DuesList({ duesList }: { duesList: Due[] }) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this due?')) {
      await deleteDue(id)
    }
  }

  const handleMarkPaid = async (id: number) => {
    await markDueAsPaid(id)
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount))
  }

  const filteredDues = duesList.filter(due => {
    if (filter === 'pending') return due.status === 'pending'
    if (filter === 'paid') return due.status === 'paid'
    return true
  })

  const pendingTotal = duesList
    .filter(d => d.status === 'pending')
    .reduce((sum, d) => sum + Number(d.amount), 0)

  const paidTotal = duesList
    .filter(d => d.status === 'paid')
    .reduce((sum, d) => sum + Number(d.amount), 0)

  if (duesList.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-4">No dues recorded yet.</p>
        <p className="text-sm text-muted-foreground">
          Track your bills and dues here.
        </p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingTotal)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Paid</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(paidTotal)}</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All ({duesList.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
        >
          Pending ({duesList.filter(d => d.status === 'pending').length})
        </Button>
        <Button
          variant={filter === 'paid' ? 'default' : 'outline'}
          onClick={() => setFilter('paid')}
          size="sm"
        >
          Paid ({duesList.filter(d => d.status === 'paid').length})
        </Button>
      </div>

      {/* Dues Table */}
      <h2 className="text-xl font-semibold text-foreground">Dues</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold">Date</th>
              <th className="text-left py-3 px-4 font-semibold">Description</th>
              <th className="text-left py-3 px-4 font-semibold">Category</th>
              <th className="text-left py-3 px-4 font-semibold">Amount</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-right py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDues.map((due) => (
              <tr key={due.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4">{formatDate(due.date)}</td>
                <td className="py-3 px-4">{due.description}</td>
                <td className="py-3 px-4">
                  {due.category && (
                    <span className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                      {due.category}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 font-medium">{formatCurrency(due.amount)}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      due.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {due.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex gap-2 justify-end">
                    {due.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkPaid(due.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark Paid
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(due.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
