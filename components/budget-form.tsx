'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const HOUSEHOLD_CATEGORIES = ['Groceries', 'Utilities', 'Transport', 'Dining', 'Entertainment', 'Healthcare', 'Shopping', 'Other']
const BUSINESS_CATEGORIES = ['Office Supplies', 'Marketing', 'Equipment', 'Salaries', 'Rent', 'Inventory', 'Other']

export function BudgetForm() {
  const [categoryType, setCategoryType] = useState<'household' | 'business'>('household')
  const [success, setSuccess] = useState(false)

  const categories = categoryType === 'business' ? BUSINESS_CATEGORIES : HOUSEHOLD_CATEGORIES

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Budget Settings</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Budgets track your spending by category. Default budgets are pre-configured. View the budget list below to see your current spending vs. limits.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Budget Type Selector */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setCategoryType('household')}
            className={`flex-1 px-4 py-2 rounded border-2 font-medium transition ${
              categoryType === 'household'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-border bg-background text-foreground hover:border-blue-300'
            }`}
          >
            Household Budgets
          </button>
          <button
            type="button"
            onClick={() => setCategoryType('business')}
            className={`flex-1 px-4 py-2 rounded border-2 font-medium transition ${
              categoryType === 'business'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-border bg-background text-foreground hover:border-orange-300'
            }`}
          >
            Business Budgets
          </button>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded text-sm">
            Settings saved!
          </div>
        )}

        <div className="bg-muted/50 p-4 rounded text-sm">
          <p className="font-medium mb-2">Available Categories:</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span key={cat} className="bg-background px-2 py-1 rounded text-xs">
                {cat}
              </span>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full">
          Refresh Budget View
        </Button>
      </form>
    </Card>
  )
}
