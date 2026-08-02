'use client'

import { useState } from 'react'
import { deleteVirmanisSale, updateVirmanisSale } from '@/app/actions/virmanis'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface VirmanisSale {
  id: number
  date: string | Date
  customerName: string
  productName: string
  quantity: string | number
  unitPrice: string | number
  totalAmount: string | number
  paymentMethod: string
  remarks?: string | null
  notes?: string | null
}

export function VirmanisList({ sales }: { sales: VirmanisSale[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<VirmanisSale>>({})

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this sale?')) {
      await deleteVirmanisSale(id)
    }
  }

  const handleEdit = (sale: VirmanisSale) => {
    setEditingId(sale.id)
    setEditData(sale)
  }

  const handleSaveEdit = async () => {
    if (editingId && editData.totalAmount) {
      await updateVirmanisSale(editingId, editData as any)
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

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount))
  }

  if (sales.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-4">No sales recorded yet.</p>
        <p className="text-sm text-muted-foreground">
          Start recording your cheese sales to see them listed here.
        </p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-foreground">Recent Sales</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold">Date</th>
              <th className="text-left py-3 px-4 font-semibold">Customer</th>
              <th className="text-left py-3 px-4 font-semibold">Product</th>
              <th className="text-left py-3 px-4 font-semibold">Qty (kg)</th>
              <th className="text-left py-3 px-4 font-semibold">Price</th>
              <th className="text-left py-3 px-4 font-semibold">Total</th>
              <th className="text-left py-3 px-4 font-semibold">Method</th>
              <th className="text-right py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b border-border hover:bg-muted/50">
                {editingId === sale.id ? (
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
                        value={editData.customerName || ''}
                        onChange={(e) => setEditData({ ...editData, customerName: e.target.value })}
                        className="border border-input rounded px-2 py-1 text-sm w-full"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={editData.productName || ''}
                        onChange={(e) => setEditData({ ...editData, productName: e.target.value })}
                        className="border border-input rounded px-2 py-1 text-sm w-full"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={editData.quantity || ''}
                        onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                        className="border border-input rounded px-2 py-1 text-sm w-full"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={editData.unitPrice || ''}
                        onChange={(e) => setEditData({ ...editData, unitPrice: e.target.value })}
                        className="border border-input rounded px-2 py-1 text-sm w-full"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={editData.totalAmount || ''}
                        onChange={(e) => setEditData({ ...editData, totalAmount: e.target.value })}
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
                    <td className="py-3 px-4">{formatDate(sale.date)}</td>
                    <td className="py-3 px-4">{sale.customerName}</td>
                    <td className="py-3 px-4">{sale.productName}</td>
                    <td className="py-3 px-4">{Number(sale.quantity).toFixed(2)}</td>
                    <td className="py-3 px-4">{formatCurrency(sale.unitPrice)}</td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(sale.totalAmount)}</td>
                    <td className="py-3 px-4 capitalize">{sale.paymentMethod}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(sale)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(sale.id)}
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
