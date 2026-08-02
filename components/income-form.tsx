'use client'

import { useState } from 'react'
import { addIncome } from '@/app/actions/income'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { FileUpload } from '@/components/file-upload'

const HOUSEHOLD_INCOME = ['Salary', 'Bonus', 'Interest', 'Other']
const BUSINESS_INCOME = ['Cheese Sales', 'Other']
const CHEESE_SALES_TYPES = ['Cheese Sales', 'Others']

export function IncomeForm() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    categoryType: 'household',
    category: 'Salary',
    subcategory: 'Salary',
    customSubcategory: '',
    clientName: '',
    amount: '',
    source: 'bank_transfer' as const,
    remarks: '',
    notes: '',
    driveFileId: '',
    driveFileUrl: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const categories = formData.categoryType === 'business' 
    ? BUSINESS_INCOME 
    : HOUSEHOLD_INCOME

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      await addIncome({
        ...formData,
        category: formData.categoryType === 'business' ? 'Virmanis United' : formData.category,
        subcategory: formData.customSubcategory || formData.subcategory,
      })
      setSuccess(true)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        categoryType: 'household',
        category: 'Salary',
        subcategory: 'Salary',
        customSubcategory: '',
        clientName: '',
        amount: '',
        source: 'bank_transfer',
        remarks: '',
        notes: '',
        driveFileId: '',
        driveFileUrl: '',
      })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add income')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Record Income</h2>
      
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
                  category: newType === 'business' ? BUSINESS_INCOME[0] : HOUSEHOLD_INCOME[0],
                  subcategory: newType === 'business' ? BUSINESS_INCOME[0] : HOUSEHOLD_INCOME[0],
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
            placeholder="e.g., Monthly salary, Product sales"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Category */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: e.target.value })}
              className="border border-input rounded-md px-3 py-2 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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

        {/* Conditional: Custom Subcategory for "Other" */}
        {formData.category === 'Other' && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="customSubcategory">Please specify the subcategory</Label>
            <Input
              id="customSubcategory"
              type="text"
              placeholder="Enter custom subcategory"
              value={formData.customSubcategory}
              onChange={(e) => setFormData({ ...formData, customSubcategory: e.target.value })}
              required
            />
          </div>
        )}

        {/* Conditional: Client Name for Cheese Sales */}
        {formData.categoryType === 'business' && formData.category === 'Cheese Sales' && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              type="text"
              placeholder="Enter client name"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              required
            />
          </div>
        )}

        {/* Source */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="source">Source</Label>
          <select
            id="source"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
            className="border border-input rounded-md px-3 py-2 text-sm"
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
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
            placeholder="Additional details..."
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
            Income recorded successfully!
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Recording...' : 'Record Income'}
        </Button>
      </form>
    </Card>
  )
}
