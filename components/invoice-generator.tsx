'use client'

import { useState, useEffect } from 'react'
import { createInvoice, getNextInvoiceNumber } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { formatRM } from '@/lib/utils/currency'
import { InvoiceModalPreview } from './invoice-modal-preview'
import { Eye } from 'lucide-react'

export function InvoiceGenerator({ clients, settings }: { clients: any[], settings: any }) {
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [showPreview, setShowPreview] = useState(false)
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

  const subtotal = lineItems.reduce((sum, item) => {
    const amount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
    return sum + amount
  }, 0)

  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === parseInt(clientId))
    if (client) {
      setFormData({
        ...formData,
        clientId,
        clientName: client.clientName,
        clientEmail: client.email || '',
        clientPhone: client.phone || '',
        clientAddress: client.address || '',
      })
    }
  }

  const handleLineItemChange = (index: number, field: string, value: string) => {
    const newItems = [...lineItems]
    newItems[index] = { ...newItems[index], [field]: value }
    
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = Number(field === 'quantity' ? value : newItems[index].quantity)
      const unitPrice = Number(field === 'unitPrice' ? value : newItems[index].unitPrice)
      newItems[index].amount = (quantity * unitPrice).toFixed(2)
    }
    
    setLineItems(newItems)
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: '', unitPrice: '', amount: '' }])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const invoiceData = {
        clientId: formData.clientId,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        clientAddress: formData.clientAddress,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          amount: Number(item.amount),
        })),
        subtotal: subtotal.toFixed(2),
        taxRate: settings?.taxRate || 0,
        taxAmount: taxAmount.toFixed(2),
        total: total.toFixed(2),
        notes: formData.notes,
      }

      await createInvoice(invoiceData)
      setSuccess(true)
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
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Invoice created successfully!
        </div>
      )}

      <Card className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Create Invoice</h2>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Client & Dates Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="client" className="font-medium">Select Client</Label>
                <select
                  id="client"
                  value={formData.clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="border border-input rounded-md px-4 py-2.5 bg-background"
                  required
                >
                  <option value="">Choose a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.clientName}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="invoiceDate" className="font-medium">Invoice Date</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label className="font-medium text-muted-foreground">Client Details</Label>
                <div className="text-sm space-y-1">
                  <p className="font-semibold">{formData.clientName || '—'}</p>
                  {formData.clientEmail && <p className="text-muted-foreground">{formData.clientEmail}</p>}
                  {formData.clientPhone && <p className="text-muted-foreground">{formData.clientPhone}</p>}
                  {formData.clientAddress && <p className="text-muted-foreground">{formData.clientAddress}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="dueDate" className="font-medium">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Line Items</h3>
            <div className="space-y-3 bg-muted/20 p-4 rounded-lg">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 font-semibold text-sm text-muted-foreground mb-2">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>

              {/* Line Items */}
              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input
                      type="text"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                      required
                      className="h-10 text-center"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                      required
                      className="h-10 text-right"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="text-right text-sm font-semibold">
                      {formatRM(parseFloat(item.amount) || 0)}
                    </div>
                  </div>
                  <div className="col-span-1">
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-destructive hover:text-destructive/80 font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addLineItem}
                className="w-full mt-2"
              >
                + Add Line Item
              </Button>
            </div>
          </div>

          {/* Totals Section */}
          <div>
            <div className="flex justify-end">
              <div className="w-full md:w-80 space-y-2 bg-muted/30 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold">{formatRM(subtotal)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({(taxRate * 100).toFixed(1)}%):</span>
                    <span className="font-semibold">{formatRM(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">{formatRM(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <Label htmlFor="notes" className="font-medium mb-2 block">Invoice Notes (Optional)</Label>
            <textarea
              id="notes"
              placeholder="Add payment terms, thank you message, or other notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-input rounded-md px-4 py-2.5 resize-none h-24 bg-background"
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </form>
      </Card>

      {/* Modal Preview */}
      <InvoiceModalPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        settings={settings}
        formData={formData}
        lineItems={lineItems}
        subtotal={subtotal}
        taxAmount={taxAmount}
        total={total}
        taxRate={taxRate}
      />
    </div>
  )
}
