'use client'

import { useState } from 'react'
import { deleteIncome, updateIncome } from '@/app/actions/income'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface Income {
  id: number
  date: string | Date
  description: string
  amount: string | number
  source: string
  notes?: string | null
}

export function IncomeList({ incomeList }: { incomeList: Income[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<Income>>({})

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this income entry?')) {
      await deleteIncome(id)
    }
  }

  const handleEdit = (incomeItem: Income) => {
    setEditingId(incomeItem.id)
    setEditData(incomeItem)
  }

  const handleSaveEdit = async () => {
    if (editingId && editData.amount) {
      await updateIncome(editingId, editData as any)
      setEditingId(null)
      setEditData({})
    }
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

  if (incomeList.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-4">No income recorded yet.</p>
        <p className="text-sm text-muted-foreground">
          Start recording your daily income to see it listed here.
        </p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-foreground">Income Records</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold">Date</th>
              <th className="text-left py-3 px-4 font-semibold">Description</th>
              <th className="text-left py-3 px-4 font-semibold">Amount</th>
              <th className="text-left py-3 px-4 font-semibold">Source</th>
              <th className="text-right py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incomeList.map((incomeItem) => (
              <tr key={incomeItem.id} className="border-b border-border hover:bg-muted/50">
                {editingId === incomeItem.id ? (
                  <>
                    <td className="py-3 px-4">
                      <input
                        type="date"
                        value={typeof editData.date === 'string' ? editData.date : new Date(editData.date!).toISOString().split('T')[0]}
                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                        className="border border-input rounded px-2 py-1 text-sm w-full"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="border border-input rounded px-2 py-1 text-sm w-full"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={editData.amount || ''}
                        onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                        className="border border-input rounded px-2 py-1 text-sm w-full"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={editData.source || ''}
                        onChange={(e) => setEditData({ ...editData, source: e.target.value })}
                        className="border border-input rounded px-2 py-1 text-sm w-full"
                      >
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right flex gap-2 justify-end">
                      <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4">{formatDate(incomeItem.date)}</td>
                    <td className="py-3 px-4">{incomeItem.description}</td>
                    <td className="py-3 px-4 font-medium text-green-600">{formatCurrency(incomeItem.amount)}</td>
                    <td className="py-3 px-4 capitalize">{incomeItem.source.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(incomeItem)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(incomeItem.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
