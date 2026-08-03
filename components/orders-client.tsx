'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { packOrder, completeOrder, cancelOrder } from '@/app/actions/orders'
import { formatRM } from '@/lib/utils/currency'

export function OrdersClient({ initialOrders }: any) {
  const [orders, setOrders] = useState(initialOrders || [])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('new')

  const handlePack = async (orderId: number) => {
    if (!confirm('Pack this order? Stock will be reserved.')) return
    setLoading(true)
    try {
      await packOrder(orderId)
      alert('Order packed!')
      window.location.reload()
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to pack order'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (orderId: number) => {
    setLoading(true)
    try {
      await completeOrder(orderId)
      alert('Order completed!')
      window.location.reload()
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to complete order'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (orderId: number) => {
    if (!confirm('Cancel this order?')) return
    setLoading(true)
    try {
      await cancelOrder(orderId)
      alert('Order cancelled!')
      window.location.reload()
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to cancel order'}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'packed':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50'
    }
  }

  const filterOrdersByStatus = (status: string) => {
    return orders.filter((o: any) => o.status === status)
  }

  const newOrders = filterOrdersByStatus('new')
  const packedOrders = filterOrdersByStatus('packed')
  const completedOrders = filterOrdersByStatus('completed')

  return (
    <div className="space-y-6">
      {/* Tab buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'new' ? 'default' : 'outline'}
          onClick={() => setActiveTab('new')}
          className="flex-1"
        >
          New ({newOrders.length})
        </Button>
        <Button
          variant={activeTab === 'packed' ? 'default' : 'outline'}
          onClick={() => setActiveTab('packed')}
          className="flex-1"
        >
          Packed ({packedOrders.length})
        </Button>
        <Button
          variant={activeTab === 'completed' ? 'default' : 'outline'}
          onClick={() => setActiveTab('completed')}
          className="flex-1"
        >
          Completed ({completedOrders.length})
        </Button>
      </div>

      {/* New Orders */}
      {activeTab === 'new' && (
        <div className="space-y-4">
          {newOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No new orders</p>
            </Card>
          ) : (
            newOrders.map((order: any) => (
              <Card key={order.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">{order.orderNumber}</p>
                    <p className="text-lg font-semibold">{order.clientName}</p>
                    <p className="text-sm text-muted-foreground">{order.orderDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">RM {formatRM(order.total)}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => handlePack(order.id)} disabled={loading}>
                    Pack
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleCancel(order.id)} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Packed Orders */}
      {activeTab === 'packed' && (
        <div className="space-y-4">
          {packedOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No packed orders</p>
            </Card>
          ) : (
            packedOrders.map((order: any) => (
              <Card key={order.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">{order.orderNumber}</p>
                    <p className="text-lg font-semibold">{order.clientName}</p>
                    <p className="text-sm text-muted-foreground">{order.orderDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">RM {formatRM(order.total)}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" onClick={() => handleComplete(order.id)} disabled={loading}>
                    Complete & Generate Invoice
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleCancel(order.id)} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Completed Orders */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No completed orders yet</p>
            </Card>
          ) : (
            completedOrders.map((order: any) => (
              <Card key={order.id} className="p-4 opacity-75">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">{order.orderNumber}</p>
                    <p className="text-lg font-semibold">{order.clientName}</p>
                    <p className="text-sm text-muted-foreground">{order.orderDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">RM {formatRM(order.total)}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
