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
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Other',
    dayOfMonth: 1,
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
      if (!formData.description || !formData.amount) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      await addRecurringBill(formData)
      setSuccess(true)
      setFormData({
        description: '',
        amount: '',
        category: 'Other',
        dayOfMonth: 1,
        notes: '',
      })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to add recurring bill')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Add Recurring Bill</h3>
        <p className="text-xs text-muted-foreground mt-1">Bills that repeat every month</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Description */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Bill Name *</Label>
          <Input
            id="description"
            type="text"
            placeholder="e.g., Electricity Bill"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={loading}
          />
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Amount (RM) *</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            disabled={loading}
          />
        </div>

        {/* Day of Month */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="dayOfMonth">Due Day of Month</Label>
          <select
            id="dayOfMonth"
            value={formData.dayOfMonth}
            onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
            disabled={loading}
            className="border border-input rounded-md px-3 py-2 text-sm bg-background"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <option key={day} value={day}>
                Day {day}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            disabled={loading}
            className="border border-input rounded-md px-3 py-2 text-sm bg-background"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <textarea
            id="notes"
            placeholder="Additional details..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="border border-input rounded-md px-3 py-2 text-sm resize-none"
            rows={2}
            disabled={loading}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-emerald-600" role="status">
            Recurring bill added successfully!
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Adding...' : 'Add Recurring Bill'}
        </Button>
      </form>
    </Card>
  )
}
