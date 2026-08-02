'use client'

import { deleteVirmaisClient, updateVirmaisClient, toggleClientActive } from '@/app/actions/virmanis-clients'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatRM } from '@/lib/utils/currency'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'

export function VirmaisClientsList({ clients }: { clients: any[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'spent' | 'recent' | 'status'>('name')
  const [showInactive, setShowInactive] = useState(false)

  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter((client) => {
      const matchesSearch =
        client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone?.includes(searchQuery) ||
        client.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = showInactive ? !client.isActive : client.isActive
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.clientName.localeCompare(b.clientName)
      } else if (sortBy === 'spent') {
        return Number(b.totalSpent) - Number(a.totalSpent)
      } else if (sortBy === 'recent') {
        return new Date(b.lastPurchaseDate || 0).getTime() - new Date(a.lastPurchaseDate || 0).getTime()
      } else if (sortBy === 'status') {
        return a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1
      }
      return 0
    })

    return filtered
  }, [clients, searchQuery, sortBy, showInactive])

  const handleDelete = async (id: number) => {
    if (confirm('Delete this client?')) {
      await deleteVirmaisClient(id)
    }
  }

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await toggleClientActive(id, !currentStatus)
      if (!currentStatus) {
        toast.success('Client reactivated')
      } else {
        toast.info('Client marked as inactive')
      }
    } catch (error) {
      toast.error('Failed to update client status')
    }
  }

  const inactiveCount = clients.filter(c => !c.isActive).length
  const activeCount = clients.filter(c => c.isActive).length

  return (
    <Card className="p-6 flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Clients Directory</h2>
        
        {/* Search Bar */}
        <div className="flex flex-col gap-3">
          <Input
            type="text"
            placeholder="Search by name, email, phone, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm"
          />

          {/* Sort Options */}
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={sortBy === 'name' ? 'default' : 'outline'}
              onClick={() => setSortBy('name')}
              className="text-xs"
            >
              Name
            </Button>
            <Button
              size="sm"
              variant={sortBy === 'spent' ? 'default' : 'outline'}
              onClick={() => setSortBy('spent')}
              className="text-xs"
            >
              Top Spenders
            </Button>
            <Button
              size="sm"
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              onClick={() => setSortBy('recent')}
              className="text-xs"
            >
              Recent
            </Button>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={!showInactive ? 'default' : 'outline'}
              onClick={() => setShowInactive(false)}
              className="text-xs"
            >
              Active ({activeCount})
            </Button>
            <Button
              size="sm"
              variant={showInactive ? 'default' : 'outline'}
              onClick={() => setShowInactive(true)}
              className="text-xs"
            >
              Inactive ({inactiveCount})
            </Button>
          </div>

          {/* Results count */}
          {searchQuery && (
            <p className="text-xs text-muted-foreground">
              Found {filteredAndSortedClients.length} of {!showInactive ? activeCount : inactiveCount} clients
            </p>
          )}
        </div>
      </div>

      {/* Scrollable Clients List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {filteredAndSortedClients.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">
              {clients.length === 0 ? 'No clients yet. Add one using the form.' : 'No clients match your search.'}
            </p>
          </div>
        ) : (
          filteredAndSortedClients.map((client) => (
            <div
              key={client.id}
              className={`border rounded-lg p-4 transition-colors ${
                client.isActive
                  ? 'border-border bg-background hover:bg-muted/50'
                  : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{client.clientName}</h3>
                    <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                      client.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {client.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {client.contactPerson && (
                      <p className="text-xs text-muted-foreground">👤 {client.contactPerson}</p>
                    )}
                    {client.email && (
                      <p className="text-xs text-muted-foreground truncate">✉️ {client.email}</p>
                    )}
                    {client.phone && (
                      <p className="text-xs text-muted-foreground">📱 {client.phone}</p>
                    )}
                    {client.address && (
                      <p className="text-xs text-muted-foreground truncate">📍 {client.address}, {client.city}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end whitespace-nowrap">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Spent</p>
                    <p className="font-semibold text-green-600 text-sm">{formatRM(Number(client.totalSpent) || 0)}</p>
                  </div>
                  {client.purchaseFrequency && (
                    <p className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1 mt-2">
                      {client.purchaseFrequency}
                    </p>
                  )}
                  {client.lastPurchaseDate && (
                    <p className="text-xs text-muted-foreground mt-1">Last: {client.lastPurchaseDate}</p>
                  )}
                </div>
              </div>

              {client.notes && (
                <p className="text-xs text-muted-foreground mt-3 italic border-t border-border pt-2">
                  {client.notes}
                </p>
              )}

              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleToggleActive(client.id, client.isActive)}
                  className="text-xs flex-1"
                >
                  {client.isActive ? 'Mark Inactive' : 'Reactivate'}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(client.id)} className="text-xs">
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
