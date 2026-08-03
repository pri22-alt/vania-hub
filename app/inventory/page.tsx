'use client'

import { useEffect, useState } from 'react'
import { getStockStatus, getInventorySummary } from '@/app/actions/inventory'
import { InventoryClient } from '@/components/inventory-client'

export default function InventoryPage() {
  const [stockStatus, setStockStatus] = useState([])
  const [summary, setSummary] = useState({ products: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [stock, summ] = await Promise.all([
          getStockStatus(),
          getInventorySummary(),
        ])
        setStockStatus(stock)
        setSummary(summ)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Inventory Management</h1>
        <InventoryClient products={summary.products || []} inventoryStatus={stockStatus} />
      </div>
    </main>
  )
}
