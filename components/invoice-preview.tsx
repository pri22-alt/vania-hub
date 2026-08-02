'use client'

import { formatRM } from '@/lib/utils/currency'

export function InvoicePreview({
  settings,
  formData,
  lineItems,
  subtotal,
  taxAmount,
  total,
  taxRate,
}: {
  settings: any
  formData: any
  lineItems: any[]
  subtotal: number
  taxAmount: number
  total: number
  taxRate: number
}) {
  return (
    <div className="sticky top-0 bg-white border border-border rounded-lg p-6 shadow-sm max-h-screen overflow-y-auto">
      <div className="space-y-4 text-sm">
        {/* Header */}
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold">INVOICE</h1>
          {settings?.logoUrl && (
            <img src={settings.logoUrl} alt="Logo" className="h-12 mt-2" />
          )}
          <div className="text-xs text-muted-foreground mt-2">
            {settings?.companyName && <p>{settings.companyName}</p>}
            {settings?.companyEmail && <p>{settings.companyEmail}</p>}
            {settings?.companyPhone && <p>{settings.companyPhone}</p>}
            {settings?.companyAddress && <p>{settings.companyAddress}</p>}
          </div>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-semibold">Invoice Date:</p>
            <p>{formData.invoiceDate}</p>
          </div>
          <div>
            <p className="font-semibold">Due Date:</p>
            <p>{formData.dueDate || '—'}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="border-t border-border pt-4">
          <p className="font-semibold text-xs mb-2">Bill To:</p>
          <div className="text-xs space-y-0.5">
            <p className="font-medium">{formData.clientName || '—'}</p>
            {formData.clientEmail && <p>{formData.clientEmail}</p>}
            {formData.clientPhone && <p>{formData.clientPhone}</p>}
            {formData.clientAddress && <p>{formData.clientAddress}</p>}
          </div>
        </div>

        {/* Line Items */}
        <div className="border-t border-border pt-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-semibold pb-2">Description</th>
                <th className="text-right font-semibold pb-2 w-12">Qty</th>
                <th className="text-right font-semibold pb-2 w-16">Price</th>
                <th className="text-right font-semibold pb-2 w-16">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2">{item.description || '—'}</td>
                  <td className="text-right py-2">{item.quantity || '—'}</td>
                  <td className="text-right py-2">{item.unitPrice ? formatRM(parseFloat(item.unitPrice)) : '—'}</td>
                  <td className="text-right py-2 font-medium">{item.amount ? formatRM(parseFloat(item.amount)) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-border pt-4 space-y-1">
          <div className="flex justify-between text-xs">
            <span>Subtotal:</span>
            <span className="font-semibold">{formatRM(subtotal)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between text-xs">
              <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
              <span className="font-semibold">{formatRM(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold border-t border-border pt-2 mt-2">
            <span>Total:</span>
            <span className="text-green-600">{formatRM(total)}</span>
          </div>
        </div>

        {/* Notes */}
        {formData.notes && (
          <div className="border-t border-border pt-4 text-xs">
            <p className="font-semibold mb-1">Notes:</p>
            <p className="text-muted-foreground whitespace-pre-wrap">{formData.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
