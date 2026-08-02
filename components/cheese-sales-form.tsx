'use client'

import { useState, useEffect } from 'react'
import { addCheeseSale } from '@/app/actions/cheese-sales'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export function CheeseSalesForm() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    productName: '',
    quantity: '',
    unitPrice: '',
    totalAmount: '',
    paymentMethod: 'cash' as const,
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Auto-calculate total amount
  useEffect(() => {
    if (formData.quantity && formData.unitPrice) {
      const total = (Number(formData.quantity) * Number(formData.unitPrice)).toFixed(2)
      setFormData(prev => ({ ...prev, totalAmount: total }))
    }
  }, [formData.quantity, formData.unitPrice])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      await addCheeseSale(formData)
      setSuccess(true)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        productName: '',
        quantity: '',
        unitPrice: '',
        totalAmount: '',
        paymentMethod: 'cash',
        notes: '',
      })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add sale')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Record New Sale</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        {/* Customer Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            id="customerName"
            type="text"
            placeholder="e.g., John Doe, ABC Restaurant"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
          />
        </div>

        {/* Product Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="productName">Product Name</Label>
          <Input
            id="productName"
            type="text"
            placeholder="e.g., Cheddar, Gouda, Mozzarella"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            required
          />
        </div>

        {/* Quantity */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="quantity">Quantity (kg)</Label>
          <Input
            id="quantity"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />
        </div>

        {/* Unit Price */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="unitPrice">Unit Price (per kg)</Label>
          <Input
            id="unitPrice"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
            required
          />
        </div>

        {/* Total Amount (Auto-calculated) */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="totalAmount">Total Amount</Label>
          <Input
            id="totalAmount"
            type="number"
            placeholder="Auto-calculated"
            value={formData.totalAmount}
            readOnly
            className="bg-muted"
          />
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

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <textarea
            id="notes"
            placeholder="Additional details..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="border border-input rounded-md px-3 py-2 text-sm resize-none"
            rows={3}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-green-600" role="status">
            Sale recorded successfully!
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Recording...' : 'Record Sale'}
        </Button>
      </form>
    </Card>
  )
}
