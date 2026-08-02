import * as XLSX from 'xlsx'

export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  // Create a new workbook
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Style the header row
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1'
    if (!ws[address]) continue
    ws[address].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4472C4' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    }
  }

  // Auto-fit columns
  const colWidths = []
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxLength = 0
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      if (ws[cellAddress] && ws[cellAddress].v) {
        const cellLength = ws[cellAddress].v.toString().length
        if (cellLength > maxLength) maxLength = cellLength
      }
    }
    colWidths.push({ wch: Math.max(maxLength + 2, 12) })
  }
  ws['!cols'] = colWidths

  // Write the file
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportExpenses(expenses: any[]) {
  const formattedData = expenses.map(expense => ({
    'Date': new Date(expense.date).toLocaleDateString('en-US'),
    'Category': expense.category,
    'Amount (RM)': expense.amount,
    'Payment Method': expense.paymentMethod,
    'Description': expense.description || '',
    'Remarks': expense.remarks || '',
    'Receipt': expense.receiptUrl ? 'Yes' : 'No',
  }))

  exportToExcel(formattedData, `Expenses-${new Date().toISOString().split('T')[0]}`, 'Expenses')
}

export function exportIncome(income: any[]) {
  const formattedData = income.map(item => ({
    'Date': new Date(item.date).toLocaleDateString('en-US'),
    'Category': item.category,
    'Subcategory': item.subcategory || '',
    'Amount (RM)': item.amount,
    'Source': item.source,
    'Description': item.description || '',
    'Remarks': item.remarks || '',
    'Document': item.driveFileUrl ? 'Yes' : 'No',
  }))

  exportToExcel(formattedData, `Income-${new Date().toISOString().split('T')[0]}`, 'Income')
}

export function exportSales(sales: any[]) {
  const formattedData = sales.map(sale => ({
    'Date': new Date(sale.date).toLocaleDateString('en-US'),
    'Customer': sale.customerName,
    'Product': sale.productName,
    'Quantity': sale.quantity,
    'Unit Price (RM)': sale.unitPrice,
    'Total Amount (RM)': sale.totalAmount,
    'Payment Method': sale.paymentMethod,
    'Remarks': sale.remarks || '',
  }))

  exportToExcel(formattedData, `Sales-${new Date().toISOString().split('T')[0]}`, 'Sales')
}

export function exportSalesStats(stats: any, startDate: string, endDate: string) {
  const data = [
    { 'Metric': 'Total Sales', 'Value': stats.totalSales || 0 },
    { 'Metric': 'Transaction Count', 'Value': stats.transactionCount || 0 },
    { 'Metric': 'Average Sale Amount', 'Value': stats.avgSaleAmount || 0 },
    { 'Metric': 'Period', 'Value': `${startDate} to ${endDate}` },
  ]

  exportToExcel(data, `Sales-Stats-${new Date().toISOString().split('T')[0]}`, 'Summary')
}

export function exportDues(dues: any[]) {
  const formattedData = dues.map(due => ({
    'Date': new Date(due.date).toLocaleDateString('en-US'),
    'Description': due.description,
    'Category': due.category,
    'Amount (RM)': due.amount,
    'Status': due.status,
    'Notes': due.notes || '',
  }))

  exportToExcel(formattedData, `Dues-${new Date().toISOString().split('T')[0]}`, 'Dues')
}

export function exportRecurringBills(bills: any[]) {
  const formattedData = bills.map(bill => ({
    'Description': bill.description,
    'Amount (RM)': bill.amount,
    'Category': bill.category,
    'Type': bill.recurringType || 'monthly',
    'Due Day': bill.dayOfMonth || '—',
    'Active': bill.isActive ? 'Yes' : 'No',
    'Notes': bill.notes || '',
  }))

  exportToExcel(formattedData, `Recurring-Bills-${new Date().toISOString().split('T')[0]}`, 'Bills')
}
