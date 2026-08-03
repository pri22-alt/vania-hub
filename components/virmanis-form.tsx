'use client'

import { useState, useEffect } from 'react'
import { addVirmanisSale } from '@/app/actions/virmanis'
import { getStockStatus } from '@/app/actions/inventory'
import { createQuickSale } from '@/app/actions/orders'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export function VirmanisSalesForm() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    productId: '',
    productName: '',
    quantity: '',
    unitPrice: '',
    totalAmount: '',
    paymentMethod: 'cash' as const,
    remarks: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [useQuickSale, setUseQuickSale] = useState(true) // Toggle between quick-sale and manual

  // Load products on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        const status = await getStockStatus()
        setProducts(status.map((s: any) => ({ id: s.productId, name: s.productName, unitPrice: s.productUnitPrice || 0 })))
      } catch (err) {
        console.error('Failed to load products:', err)
      }
    }
    loadProducts()
  }, [])

  // Auto-calculate total amount
  useEffect(() => {
    if (formData.quantity && formData.unitPrice) {
      const total = (Number(formData.quantity) * Number(formData.unitPrice)).toFixed(2)
      setFormData(prev => ({ ...prev, totalAmount: total }))
    }
  }, [formData.quantity, formData.unitPrice])

  // Set unit price when product is selected
  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === Number(productId))
    setFormData(prev => ({
      ...prev,
      productId,
      productName: product?.name || '',
      unitPrice: product?.unitPrice?.toString() || '',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      if (useQuickSale && formData.productId) {
        // Quick sale: creates auto-completed order + deducts inventory + records sale
        await createQuickSale({
          date: formData.date,
          customerName: formData.customerName,
          productId: parseInt(formData.productId),
          productName: formData.productName,
          quantity: parseFloat(formData.quantity),
          unitPrice: parseFloat(formData.unitPrice),
          totalAmount: parseFloat(formData.totalAmount),
          paymentMethod: formData.paymentMethod,
          remarks: formData.remarks,
          notes: formData.notes,
        })
      } else {
        // Manual sale: just records sale without inventory deduction (for manual entry)
        await addVirmanisSale({
          date: formData.date,
          customerName: formData.customerName,
          productName: formData.productName,
          quantity: formData.quantity,
          unitPrice: formData.unitPrice,
          totalAmount: formData.totalAmount,
          paymentMethod: formData.paymentMethod,
          remarks: formData.remarks,
          notes: formData.notes,
        })
      }
      
      setSuccess(true)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        productId: '',
        productName: '',
        quantity: '',
        unitPrice: '',
        totalAmount: '',
        paymentMethod: 'cash',
        remarks: '',
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

        {/* Sale Type Toggle */}
        <div className="flex gap-2 mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={useQuickSale}
              onChange={() => setUseQuickSale(true)}
              className="w-4 h-4"
            />
            <span className="text-sm">Quick Sale (deducts inventory)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!useQuickSale}
              onChange={() => setUseQuickSale(false)}
              className="w-4 h-4"
            />
            <span className="text-sm">Manual Entry (no inventory)</span>
          </label>
        </div>

        {/* Product */}
        {useQuickSale ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="productId">Product</Label>
            <select
              id="productId"
              value={formData.productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="border border-input rounded-md px-3 py-2 text-sm"
              required={useQuickSale}
            >
              <option value="">Select product...</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              type="text"
              placeholder="e.g., Cheddar, Gouda, Mozzarella"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              required={!useQuickSale}
            />
          </div>
        )}

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
