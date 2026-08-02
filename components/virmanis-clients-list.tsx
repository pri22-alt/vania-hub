'use client'

import { deleteVirmaisClient, updateVirmaisClient } from '@/app/actions/virmanis-clients'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatRM } from '@/lib/utils/currency'
import { useState } from 'react'

export function VirmaisClientsList({ clients }: { clients: any[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (confirm('Delete this client?')) {
      await deleteVirmaisClient(id)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Clients Directory</h2>
      
      {clients.length === 0 ? (
        <p className="text-muted-foreground text-sm">No clients yet. Add one above.</p>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <div key={client.id} className="border border-border rounded-lg p-4 bg-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{client.clientName}</h3>
                  {client.contactPerson && <p className="text-xs text-muted-foreground">Contact: {client.contactPerson}</p>}
                  {client.email && <p className="text-xs text-muted-foreground">{client.email}</p>}
                  {client.phone && <p className="text-xs text-muted-foreground">{client.phone}</p>}
                  {client.address && <p className="text-xs text-muted-foreground">{client.address}, {client.city}</p>}
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="font-semibold text-foreground">{formatRM(Number(client.totalSpent) || 0)}</p>
                  {client.purchaseFrequency && (
                    <p className="text-xs text-blue-600 mt-1">{client.purchaseFrequency}</p>
                  )}
                  {client.lastPurchaseDate && (
                    <p className="text-xs text-muted-foreground mt-1">Last: {client.lastPurchaseDate}</p>
                  )}
                </div>
              </div>
              
              {client.notes && <p className="text-xs text-muted-foreground mt-2">{client.notes}</p>}
              
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => setEditingId(client.id)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(client.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
