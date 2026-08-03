'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { recordMovement } from '@/app/actions/inventory'

export function InventoryClient({ products, inventoryStatus }: any) {
  const [activeTab, setActiveTab] = useState('products')
  const [stockForm, setStockForm] = useState({ productId: '', quantity: '0', date: new Date().toISOString().split('T')[0] })
  const [loading, setLoading] = useState(false)

  const handleStockIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stockForm.productId) {
      alert('Select a product')
      return
    }
    setLoading(true)
    try {
      await recordMovement({
        productId: parseInt(stockForm.productId),
        movementType: 'purchase',
        quantity: parseFloat(stockForm.quantity),
        movementDate: stockForm.date,
        referenceType: 'manual',
        notes: 'Manual stock-in',
      })
      setStockForm({ productId: '', quantity: '0', date: new Date().toISOString().split('T')[0] })
      alert('Stock recorded!')
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to record stock'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'stock-in' ? 'default' : 'outline'}
          onClick={() => setActiveTab('stock-in')}
          className="flex-1"
        >
          Stock In
        </Button>
        <Button
          variant={activeTab === 'status' ? 'default' : 'outline'}
          onClick={() => setActiveTab('status')}
          className="flex-1"
        >
          Status
        </Button>
        <Button
          variant={activeTab === 'reports' ? 'default' : 'outline'}
          onClick={() => setActiveTab('reports')}
          className="flex-1"
        >
          Reports
        </Button>
      </div>

      {/* Stock In */}
      {activeTab === 'stock-in' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Record Stock In</h2>
            <form onSubmit={handleStockIn} className="space-y-4">
              <div>
                <Label>Product</Label>
                <select
                  value={stockForm.productId}
                  onChange={(e) => setStockForm({ ...stockForm, productId: e.target.value })}
                  className="w-full border border-input rounded px-3 py-2"
                  required
                >
                  <option value="">Select product...</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={stockForm.date}
                  onChange={(e) => setStockForm({ ...stockForm, date: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Recording...' : 'Record Stock In'}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Inventory Status */}
      {activeTab === 'status' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Current Stock Status</h2>
            <div className="space-y-3">
              {inventoryStatus.map((item: any) => (
                <div key={item.productId} className="flex justify-between items-center p-4 border rounded">
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">{item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{item.available.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Available {item.reserved > 0 && `| ${item.reserved.toFixed(2)} Reserved`}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Stock Reports</h2>
            <p className="text-muted-foreground">Daily and monthly stock movement reports coming soon</p>
          </Card>
        </div>
      )}
    </div>
  )
}
