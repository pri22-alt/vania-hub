'use client'

import { useState } from 'react'
import { addRecurringBill } from '@/app/actions/recurring-bills'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

const CATEGORIES = [
  'Utilities',
  'Rent',
  'Loan',
  'Insurance',
  'Subscription',
  'Services',
  'Other',
]

export function RecurringBillsForm() {
  const today = new Date()
  const [formData, setFormData] = useState({
    date: today.toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'Other',
    notes: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      await addRecurringBill({
        date: formData.date,
        description: formData.description,
        amount: formData.amount,
        category: formData.category,
        notes: formData.notes,
      })

      setSuccess(true)
      setFormData({
        date: today.toISOString().split('T')[0],
        description: '',
        amount: '',
        category: 'Other',
        notes: '',
      })

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add recurring bill')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Add Recurring Bill</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="description" className="text-sm">Description *</Label>
          <Input
            id="description"
            type="text"
            placeholder="e.g., Internet Bill, Gym Membership"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount" className="text-sm">Amount (RM) *</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="category" className="text-sm">Category *</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="border border-input rounded-md px-3 py-2 text-sm bg-background"
            required
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Date (day of month) */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="date" className="text-sm">Due Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground">This bill will repeat monthly on the day you specify</p>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="notes" className="text-sm">Notes (Optional)</Label>
          <textarea
            id="notes"
            placeholder="Add any additional notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="border border-input rounded-md px-3 py-2 text-sm resize-none h-16"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-600" role="status">Recurring bill added successfully!</p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Adding...' : 'Add Recurring Bill'}
        </Button>
      </form>
    </Card>
  )
}
