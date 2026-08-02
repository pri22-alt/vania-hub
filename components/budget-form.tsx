'use client'

import { useState } from 'react'
import { addBudget } from '@/app/actions/budgets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

const HOUSEHOLD_CATEGORIES = ['Groceries', 'Utilities', 'Rent', 'Transportation', 'Entertainment', 'Dining', 'Shopping', 'Health', 'Other']
const BUSINESS_CATEGORIES = ['Salaries', 'Office Supplies', 'Marketing', 'Utilities', 'Inventory', 'Equipment', 'Other']

export function BudgetForm() {
  const [formData, setFormData] = useState({
    name: '',
    categoryType: 'household',
    category: 'Groceries',
    budgetAmount: '',
    period: 'monthly',
    month: new Date().toISOString().slice(0, 7),
    alertThreshold: '80',
    notes: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const categories = formData.categoryType === 'business' ? BUSINESS_CATEGORIES : HOUSEHOLD_CATEGORIES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      await addBudget({
        name: formData.name || `${formData.category} Budget`,
        categoryType: formData.categoryType,
        category: formData.category,
        budgetAmount: formData.budgetAmount,
        period: formData.period,
        month: formData.period === 'monthly' ? formData.month : undefined,
        alertThreshold: parseInt(formData.alertThreshold),
        notes: formData.notes,
      })

      setSuccess(true)
      setFormData({
        name: '',
        categoryType: 'household',
        category: 'Groceries',
        budgetAmount: '',
        period: 'monthly',
        month: new Date().toISOString().slice(0, 7),
        alertThreshold: '80',
        notes: '',
      })

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add budget')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 sticky top-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Create Budget</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="text-sm">Budget Name (Optional)</Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., Monthly Grocery Budget"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Category Type */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="categoryType" className="text-sm">Type</Label>
          <select
            id="categoryType"
            value={formData.categoryType}
            onChange={(e) => {
              const newType = e.target.value
              const defaultCat = newType === 'business' ? BUSINESS_CATEGORIES[0] : HOUSEHOLD_CATEGORIES[0]
              setFormData({
                ...formData,
                categoryType: newType,
                category: defaultCat,
              })
            }}
            className="border border-input rounded-md px-3 py-2 text-sm bg-background"
          >
            <option value="household">Household</option>
            <option value="business">Business</option>
          </select>
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
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Budget Amount */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="budgetAmount" className="text-sm">Budget Amount (RM) *</Label>
          <Input
            id="budgetAmount"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={formData.budgetAmount}
            onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
            required
          />
        </div>

        {/* Period */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="period" className="text-sm">Period</Label>
          <select
            id="period"
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            className="border border-input rounded-md px-3 py-2 text-sm bg-background"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* Month (for monthly budgets) */}
        {formData.period === 'monthly' && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="month" className="text-sm">Month</Label>
            <Input
              id="month"
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            />
          </div>
        )}

        {/* Alert Threshold */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="alertThreshold" className="text-sm">Alert at % Spent</Label>
          <div className="flex items-center gap-2">
            <Input
              id="alertThreshold"
              type="number"
              min="0"
              max="100"
              value={formData.alertThreshold}
              onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <p className="text-xs text-muted-foreground">You&apos;ll be alerted when spending reaches this percentage</p>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="notes" className="text-sm">Notes (Optional)</Label>
          <textarea
            id="notes"
            placeholder="Add notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="border border-input rounded-md px-3 py-2 text-sm resize-none h-16"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-600" role="status">Budget created successfully!</p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating...' : 'Create Budget'}
        </Button>
      </form>
    </Card>
  )
}
