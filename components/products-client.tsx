'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addProduct, getProducts, updateProduct, deleteProduct } from '@/app/actions/products-management'

export function ProductsClient() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: '', unit: 'kg', unitPrice: '0', reorderLevel: '0' })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const list = await getProducts()
    setProducts(list)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        await updateProduct(editingId, formData.name, formData.unit, parseFloat(formData.unitPrice), parseFloat(formData.reorderLevel))
        setEditingId(null)
      } else {
        await addProduct(formData.name, formData.unit, parseFloat(formData.unitPrice), parseFloat(formData.reorderLevel))
      }
      setFormData({ name: '', unit: 'kg', unitPrice: '0', reorderLevel: '0' })
      setShowForm(false)
      await loadProducts()
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: any) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      unit: product.unit,
      unitPrice: product.unitPrice.toString(),
      reorderLevel: product.reorderLevel.toString(),
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    setLoading(true)
    try {
      await deleteProduct(id)
      await loadProducts()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', unit: 'kg', unitPrice: '0', reorderLevel: '0' }) }}>
            + Add Product
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Cheddar Cheese"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <select
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm mt-1 bg-background"
                >
                  <option>kg</option>
                  <option>block</option>
                  <option>piece</option>
                  <option>box</option>
                  <option>liter</option>
                </select>
              </div>
              <div>
                <Label htmlFor="unitPrice">Unit Price (RM)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  step="0.01"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowForm(false); setEditingId(null) }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Products Table */}
      {products.length > 0 && (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Product Name</th>
                <th className="px-6 py-3 text-left font-semibold">Unit</th>
                <th className="px-6 py-3 text-right font-semibold">Unit Price</th>
                <th className="px-6 py-3 text-right font-semibold">Reorder Level</th>
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4">{product.unit}</td>
                  <td className="px-6 py-4 text-right">RM {product.unitPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">{product.reorderLevel}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      disabled={loading}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                      disabled={loading}
                      className="text-destructive"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {products.length === 0 && !showForm && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No products yet. Add your first product to get started.</p>
        </Card>
      )}
    </div>
  )
}
