'use client'

import { useState } from 'react'
import { deleteInvoice, updateInvoiceStatus, getInvoiceWithLineItems } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatRM } from '@/lib/utils/currency'
import jsPDF from 'jspdf'

export function InvoiceList({ invoices, companySettings }: { invoices: any[], companySettings: any }) {
  const [downloading, setDownloading] = useState<number | null>(null)

  const generatePDF = async (invoice: any) => {
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15
      let yPosition = margin

      // Logo
      if (companySettings?.logoUrl) {
        doc.addImage(companySettings.logoUrl, 'PNG', margin, yPosition, 30, 30)
        yPosition += 35
      }

      // Company info
      doc.setFontSize(14)
      doc.text(companySettings?.companyName || 'Virmanis United', margin, yPosition)
      yPosition += 7

      doc.setFontSize(9)
      if (companySettings?.companyAddress) {
        doc.text(companySettings.companyAddress, margin, yPosition)
        yPosition += 5
      }
      if (companySettings?.companyEmail) {
        doc.text(`Email: ${companySettings.companyEmail}`, margin, yPosition)
        yPosition += 5
      }
      if (companySettings?.companyPhone) {
        doc.text(`Phone: ${companySettings.companyPhone}`, margin, yPosition)
        yPosition += 5
      }

      yPosition += 5

      // Invoice title
      doc.setFontSize(20)
      doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10

      doc.setFontSize(9)
      doc.text(`Invoice #: ${invoice.invoiceNumber}`, margin, yPosition)
      yPosition += 5
      doc.text(`Date: ${invoice.invoiceDate}`, margin, yPosition)
      yPosition += 5
      if (invoice.dueDate) {
        doc.text(`Due Date: ${invoice.dueDate}`, margin, yPosition)
        yPosition += 5
      }

      yPosition += 5

      // Bill to
      doc.setFontSize(11)
      doc.text('BILL TO:', margin, yPosition)
      yPosition += 6

      doc.setFontSize(9)
      doc.text(invoice.clientName, margin, yPosition)
      yPosition += 4
      if (invoice.clientAddress) {
        doc.text(invoice.clientAddress, margin, yPosition)
        yPosition += 4
      }
      if (invoice.clientEmail) {
        doc.text(invoice.clientEmail, margin, yPosition)
        yPosition += 4
      }
      if (invoice.clientPhone) {
        doc.text(invoice.clientPhone, margin, yPosition)
        yPosition += 4
      }

      yPosition += 5

      // Line items table header
      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      doc.text('Description', margin, yPosition)
      doc.text('Qty', margin + 90, yPosition)
      doc.text('Unit Price', margin + 115, yPosition)
      doc.text('Amount', margin + 150, yPosition)
      
      doc.setDrawColor(200)
      doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2)
      yPosition += 7

      // Line items
      doc.setFont(undefined, 'normal')
      doc.setFontSize(9)
      
      // Get line items from invoice
      const lineItems = (invoice.lineItems || [])
      lineItems.forEach((item: any) => {
        doc.text(item.description, margin, yPosition)
        doc.text(item.quantity.toString(), margin + 90, yPosition)
        doc.text(`RM ${parseFloat(item.unitPrice).toFixed(2)}`, margin + 115, yPosition)
        doc.text(`RM ${parseFloat(item.amount).toFixed(2)}`, margin + 150, yPosition)
        yPosition += 5
      })

      yPosition += 3

      // Totals
      doc.setDrawColor(200)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 5

      doc.setFont(undefined, 'bold')
      doc.text('Subtotal:', margin + 115, yPosition)
      doc.text(`RM ${parseFloat(invoice.subtotal).toFixed(2)}`, margin + 150, yPosition)
      yPosition += 5

      if (invoice.taxAmount > 0) {
        doc.text('Tax:', margin + 115, yPosition)
        doc.text(`RM ${parseFloat(invoice.taxAmount).toFixed(2)}`, margin + 150, yPosition)
        yPosition += 5
      }

      doc.setFontSize(11)
      doc.text('Total:', margin + 115, yPosition)
      doc.text(`RM ${parseFloat(invoice.totalAmount).toFixed(2)}`, margin + 150, yPosition)

      // Bank details
      if (companySettings?.bankDetails) {
        yPosition = pageHeight - 40
        doc.setFontSize(9)
        doc.setFont(undefined, 'bold')
        doc.text('Bank Details:', margin, yPosition)
        yPosition += 5
        doc.setFont(undefined, 'normal')
        doc.text(companySettings.bankDetails, margin, yPosition, { maxWidth: pageWidth - margin * 2 })
      }

      // Download
      doc.save(`${invoice.invoiceNumber}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Delete this invoice?')) {
      await deleteInvoice(id)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Invoices</h2>

      {invoices.length === 0 ? (
        <p className="text-muted-foreground text-sm">No invoices created yet.</p>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="border border-border rounded-lg p-4 bg-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{invoice.invoiceNumber}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{invoice.clientName}</p>
                  <p className="text-xs text-muted-foreground">Date: {invoice.invoiceDate}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-green-600">{formatRM(Number(invoice.totalAmount))}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => generatePDF(invoice)}
                  disabled={downloading === invoice.id}
                >
                  {downloading === invoice.id ? 'Generating...' : 'Download PDF'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateInvoiceStatus(invoice.id, invoice.status === 'draft' ? 'sent' : 'paid')}
                >
                  {invoice.status === 'draft' ? 'Mark Sent' : invoice.status === 'sent' ? 'Mark Paid' : 'Paid'}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(invoice.id)}>
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
