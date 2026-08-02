'use client'

import { formatRM } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

export function InvoiceModalPreview({
  isOpen,
  onClose,
  settings,
  formData,
  lineItems,
  subtotal,
  taxAmount,
  total,
  taxRate,
}: any) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between bg-white border-b p-4">
          <h2 className="text-lg font-semibold">Invoice Preview</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 bg-white">
          {/* Company Header */}
          <div className="mb-8 border-b pb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{settings?.companyName || 'Company Name'}</h1>
            <p className="text-sm text-muted-foreground">{settings?.companyEmail}</p>
            <p className="text-sm text-muted-foreground">{settings?.companyPhone}</p>
            <p className="text-sm text-muted-foreground">{settings?.companyAddress}</p>
          </div>

          {/* Invoice Title & Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">INVOICE</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice #:</span>
                  <span className="font-semibold">---</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Date:</span>
                  <span>{new Date(formData.invoiceDate).toLocaleDateString('en-US')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span>{formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('en-US') : '—'}</span>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Bill To:</h3>
              <p className="font-semibold text-foreground">{formData.clientName || '—'}</p>
              {formData.clientEmail && <p className="text-sm text-muted-foreground">{formData.clientEmail}</p>}
              {formData.clientPhone && <p className="text-sm text-muted-foreground">{formData.clientPhone}</p>}
              {formData.clientAddress && <p className="text-sm text-muted-foreground">{formData.clientAddress}</p>}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground">
                  <th className="text-left py-2 font-semibold">Description</th>
                  <th className="text-center py-2 font-semibold w-20">Qty</th>
                  <th className="text-right py-2 font-semibold w-24">Unit Price</th>
                  <th className="text-right py-2 font-semibold w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-muted">
                    <td className="py-3">{item.description || '—'}</td>
                    <td className="text-center py-3">{item.quantity || '—'}</td>
                    <td className="text-right py-3">{formatRM(parseFloat(item.unitPrice) || 0)}</td>
                    <td className="text-right py-3 font-semibold">{formatRM(parseFloat(item.amount) || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatRM(subtotal)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">Tax ({(taxRate * 100).toFixed(1)}%):</span>
                  <span>{formatRM(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-foreground pt-2">
                <span>Total:</span>
                <span className="text-green-600">{formatRM(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {formData.notes && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-foreground mb-2">Notes:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
