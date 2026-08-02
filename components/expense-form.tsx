'use client'

import { useState } from 'react'
import { addExpense } from '@/app/actions/expenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { FileUpload } from '@/components/file-upload'

const CATEGORY_TYPE = ['household', 'business']
const HOUSEHOLD_SUBCATEGORIES = ['Groceries', 'Utilities', 'Transport', 'Healthcare', 'Education', 'Entertainment', 'Other']
const BUSINESS_SUBCATEGORIES = ['Entertainment', 'Transport', 'Petrol', 'Supplies', 'Utilities', 'Other']

export function ExpenseForm() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    categoryType: 'household',
    category: 'Groceries',
    subcategory: 'Groceries',
    amount: '',
    paymentMethod: 'cash' as const,
    googleFormsLink: '',
    remarks: '',
    notes: '',
    driveFileId: '',
    driveFileUrl: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const subcategories = formData.categoryType === 'business' 
    ? BUSINESS_SUBCATEGORIES 
    : HOUSEHOLD_SUBCATEGORIES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      await addExpense({
        ...formData,
        category: formData.categoryType === 'business' ? 'Virmanis United' : formData.category,
      })
      setSuccess(true)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        categoryType: 'household',
        category: 'Groceries',
        subcategory: 'Groceries',
        amount: '',
        paymentMethod: 'cash',
        googleFormsLink: '',
        remarks: '',
        notes: '',
        driveFileId: '',
        driveFileUrl: '',
      })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Add New Expense</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {/* Category Type */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="categoryType">Type</Label>
            <select
              id="categoryType"
              value={formData.categoryType}
              onChange={(e) => {
                const newType = e.target.value
                setFormData({
                  ...formData,
                  categoryType: newType,
                  subcategory: newType === 'business' ? BUSINESS_SUBCATEGORIES[0] : HOUSEHOLD_SUBCATEGORIES[0],
                })
              }}
              className="border border-input rounded-md px-3 py-2 text-sm"
            >
              <option value="household">Household</option>
              <option value="business">Business (Virmanis United)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            type="text"
            placeholder="e.g., Weekly shopping, Office supplies"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Subcategory */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="subcategory">Subcategory</Label>
            <select
              id="subcategory"
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              className="border border-input rounded-md px-3 py-2 text-sm"
            >
              {subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount</Label>
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
        </div>

        {/* Payment Method */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <select
            id="paymentMethod"
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
            className="border border-input rounded-md px-3 py-2 text-sm"
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank Transfer</option>
            <option value="card">Card</option>
          </select>
        </div>

        {/* Google Forms Link */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="googleFormsLink">Receipt Link (Optional)</Label>
          <Input
            id="googleFormsLink"
            type="url"
            placeholder="Link to Google Form or receipt"
            value={formData.googleFormsLink}
            onChange={(e) => setFormData({ ...formData, googleFormsLink: e.target.value })}
          />
        </div>

        {/* Remarks */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="remarks">Remarks (Optional)</Label>
          <textarea
            id="remarks"
            placeholder="Additional remarks or context..."
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            className="border border-input rounded-md px-3 py-2 text-sm resize-none"
            rows={2}
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <textarea
            id="notes"
            placeholder="Additional notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="border border-input rounded-md px-3 py-2 text-sm resize-none"
            rows={2}
          />
        </div>

        {/* Receipt Upload */}
        <div className="flex flex-col gap-2">
          <Label>Receipt Photo/Document (Optional)</Label>
          <FileUpload
            onFileSelect={(file, url, fileId) => {
              setFormData({
                ...formData,
                driveFileUrl: url || '',
                driveFileId: fileId || '',
              })
            }}
            disabled={loading}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-green-600" role="status">
            Expense added successfully!
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Adding...' : 'Add Expense'}
        </Button>
      </form>
    </Card>
  )
}
