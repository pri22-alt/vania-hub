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

const RECURRENCE_TYPES = [
  { value: 'monthly', label: 'Monthly (same day each month)' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly (every 2 weeks)' },
  { value: 'custom', label: 'Custom Dates' },
]

export function RecurringBillsForm() {
  const today = new Date()
  const [formData, setFormData] = useState({
    startDate: today.toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'Other',
    recurringType: 'monthly',
    dayOfMonth: today.getDate(),
    customDates: [] as string[],
    notes: '',
  })
  const [customDateInput, setCustomDateInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleAddCustomDate = () => {
    if (customDateInput && !formData.customDates.includes(customDateInput)) {
      setFormData({
        ...formData,
        customDates: [...formData.customDates, customDateInput].sort(),
      })
      setCustomDateInput('')
    }
  }

  const handleRemoveCustomDate = (dateToRemove: string) => {
    setFormData({
      ...formData,
      customDates: formData.customDates.filter(d => d !== dateToRemove),
    })
  }

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

      if (formData.recurringType === 'custom' && formData.customDates.length === 0) {
        setError('Please add at least one custom date')
        setLoading(false)
        return
      }

      await addRecurringBill(formData)
      setSuccess(true)
      const today = new Date()
      setFormData({
        startDate: today.toISOString().split('T')[0],
        description: '',
        amount: '',
        category: 'Other',
        recurringType: 'monthly',
        dayOfMonth: today.getDate(),
        customDates: [],
        notes: '',
      })
      setCustomDateInput('')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add recurring bill')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Add Recurring Bill</h3>
        <p className="text-xs text-muted-foreground mt-1">Set up bills that repeat at regular intervals</p>
      </div>

      {error && <div className="text-sm text-destructive mb-4 bg-destructive/10 p-3 rounded">{error}</div>}
      {success && <div className="text-sm text-green-600 mb-4 bg-green-100 p-3 rounded">Recurring bill added successfully!</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Start Date */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="startDate" className="text-sm font-medium">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value)
              setFormData({
                ...formData,
                startDate: e.target.value,
                dayOfMonth: selectedDate.getDate(),
              })
            }}
            required
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="description" className="text-sm font-medium">Bill Name *</Label>
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
        <div className="flex flex-col gap-1">
          <Label htmlFor="amount" className="text-sm font-medium">Amount (RM) *</Label>
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

        {/* Category */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="category" className="text-sm font-medium">Category</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            disabled={loading}
            className="border border-input rounded-md px-3 py-2 text-sm bg-background"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Recurrence Type */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="recurringType" className="text-sm font-medium">Repeats *</Label>
          <select
            id="recurringType"
            value={formData.recurringType}
            onChange={(e) => setFormData({ ...formData, recurringType: e.target.value })}
            disabled={loading}
            className="border border-input rounded-md px-3 py-2 text-sm bg-background"
          >
            {RECURRENCE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Day of Month (for monthly) */}
        {formData.recurringType === 'monthly' && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="dayOfMonth" className="text-sm font-medium">Day of Month</Label>
            <select
              id="dayOfMonth"
              value={formData.dayOfMonth}
              onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
              disabled={loading}
              className="border border-input rounded-md px-3 py-2 text-sm bg-background"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>Day {day}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Bill will repeat on day <strong>{formData.dayOfMonth}</strong> of every month
            </p>
          </div>
        )}

        {/* Custom Dates (for custom recurrence) */}
        {formData.recurringType === 'custom' && (
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Custom Dates</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={customDateInput}
                onChange={(e) => setCustomDateInput(e.target.value)}
                placeholder="Select a date"
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCustomDate}
                disabled={loading || !customDateInput}
              >
                Add
              </Button>
            </div>
            {formData.customDates.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.customDates.map(date => (
                  <div key={date} className="flex items-center gap-2 bg-muted px-3 py-1 rounded text-sm">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomDate(date)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.customDates.length} date{formData.customDates.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
          <textarea
            id="notes"
            placeholder="Additional notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            disabled={loading}
            className="border border-input rounded-md px-3 py-2 text-sm resize-none h-16"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Adding...' : 'Add Recurring Bill'}
        </Button>
      </form>
    </Card>
  )
}
