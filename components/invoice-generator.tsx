'use client'

import { useState } from 'react'
import { createInvoice, getNextInvoiceNumber } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { formatRM } from '@/lib/utils/currency'

export function InvoiceGenerator({ clients, settings }: { clients: any[], settings: any }) {
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
  })
  const [lineItems, setLineItems] = useState([
    { description: '', quantity: '', unitPrice: '', amount: '' }
  ])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const taxRate = Number(settings?.taxRate || 0) / 100

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === parseInt(clientId))
    if (client) {
      setFormData({
        ...formData,
        clientId,
        clientName: client.clientName,
        clientEmail: client.email || '',
        clientPhone: client.phone || '',
        clientAddress: `${client.address || ''} ${client.city || ''}`.trim(),
      })
    }
  }

  const handleLineItemChange = (index: number, field: string, value: string) => {
    const newItems = [...lineItems]
    newItems[index] = { ...newItems[index], [field]: value }

    if (field === 'quantity' || field === 'unitPrice') {
      const qty = parseFloat(newItems[index].quantity) || 0
      const price = parseFloat(newItems[index].unitPrice) || 0
      newItems[index].amount = (qty * price).toFixed(2)
    }

    setLineItems(newItems)
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: '', unitPrice: '', amount: '' }])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const subtotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newInvoice = await createInvoice({
        clientId: parseInt(formData.clientId),
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        clientAddress: formData.clientAddress,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: total.toFixed(2),
        notes: formData.notes,
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

      // Reset form
      setFormData({
        clientId: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: '',
      })
      setLineItems([{ description: '', quantity: '', unitPrice: '', amount: '' }])
    } catch (error) {
      console.error('Error creating invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Create Invoice</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="client">Select Client</Label>
            <select
              id="client"
              value={formData.clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="border border-input rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">Choose a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.clientName}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="invoiceDate">Invoice Date</Label>
            <Input
              id="invoiceDate"
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="border-t border-border pt-6">
          <h3 className="font-semibold text-foreground mb-4">Line Items</h3>
          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Label className="text-xs">Description</Label>
                  <Input
                    type="text"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Unit Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={item.unitPrice}
                    onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Amount</Label>
                  <Input
                    type="text"
                    value={formatRM(parseFloat(item.amount) || 0)}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="col-span-1">
                  {lineItems.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                    >
                      -
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="mt-3">
            + Add Line Item
          </Button>
        </div>

        {/* Totals */}
        <div className="border-t border-border pt-6 space-y-2">
          <div className="flex justify-between items-center">
            <span>Subtotal:</span>
            <span className="font-semibold">{formatRM(subtotal)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between items-center">
              <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
              <span className="font-semibold">{formatRM(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold border-t border-border pt-2">
            <span>Total:</span>
            <span className="text-green-600">{formatRM(total)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="notes">Invoice Notes</Label>
          <textarea
            id="notes"
            placeholder="Additional notes, payment terms, etc."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="border border-input rounded-md px-3 py-2 text-sm resize-none"
            rows={2}
          />
        </div>

        {success && <p className="text-sm text-green-600">Invoice created successfully!</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating...' : 'Create Invoice'}
        </Button>
      </form>
    </Card>
  )
}
