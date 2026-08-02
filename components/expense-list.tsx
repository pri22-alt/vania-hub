'use client'

import { useState } from 'react'
import { deleteExpense, updateExpense } from '@/app/actions/expenses'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { formatRM } from '@/lib/utils/currency'
import { exportExpensesReport } from '@/lib/utils/export'

export interface Expense {
  id: number
  date: string | Date
  description: string
  category: string
  amount: string | number
  paymentMethod: string
  googleFormsLink?: string | null
  notes?: string | null
}

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<Expense>>({})

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setEditData(expense)
  }

  const handleSaveEdit = async () => {
    if (editingId && editData.amount) {
      await updateExpense(editingId, editData as any)
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



  if (expenses.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-4">No expenses recorded yet.</p>
        <p className="text-sm text-muted-foreground">
          Start tracking your daily expenses to see them listed here.
        </p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Recent Expenses</h2>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => exportExpensesReport(expenses, 'all')}
          className="text-xs"
        >
          📥 Export CSV
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold">Date</th>
              <th className="text-left py-3 px-4 font-semibold">Description</th>
              <th className="text-left py-3 px-4 font-semibold">Category</th>
              <th className="text-left py-3 px-4 font-semibold">Amount</th>
              <th className="text-left py-3 px-4 font-semibold">Method</th>
              <th className="text-right py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b border-border hover:bg-muted/50">
                {editingId === expense.id ? (
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
                        type="text"
                        value={editData.category || ''}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
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
                        value={editData.paymentMethod || ''}
                        onChange={(e) => setEditData({ ...editData, paymentMethod: e.target.value })}
                        className="border border-input rounded px-2 py-1 text-sm w-full"
                      >
                        <option value="cash">Cash</option>
                        <option value="bank">Bank</option>
                        <option value="card">Card</option>
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
                    <td className="py-3 px-4">{formatDate(expense.date)}</td>
                    <td className="py-3 px-4">{expense.description}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{formatRM(expense.amount)}</td>
                    <td className="py-3 px-4 capitalize">{expense.paymentMethod}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {expense.googleFormsLink && (
                          <Link href={expense.googleFormsLink} target="_blank">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </Link>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(expense)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(expense.id)}
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
