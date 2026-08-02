import { formatRM } from './currency'

// Export data to CSV
export function downloadCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header]
          // Handle strings with commas by wrapping in quotes
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`
          }
          return value ?? ''
        })
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

// Export expenses report
export function exportExpensesReport(
  expenses: any[],
  dateRange: string
) {
  const formattedData = expenses.map(expense => ({
    Date: typeof expense.date === 'string' ? expense.date : new Date(expense.date).toISOString().split('T')[0],
    Description: expense.description,
    Category: expense.category,
    'Sub Category': expense.subcategory || '-',
    'Category Type': expense.categoryType,
    Amount: formatRM(expense.amount),
    'Payment Method': expense.paymentmethod,
    Remarks: expense.remarks || '-',
    Notes: expense.notes || '-',
  }))

  downloadCSV(formattedData, `expenses-report-${dateRange}`)
}

// Export income report
export function exportIncomeReport(
  incomeList: any[],
  dateRange: string
) {
  const formattedData = incomeList.map(income => ({
    Date: typeof income.date === 'string' ? income.date : new Date(income.date).toISOString().split('T')[0],
    Description: income.description,
    Category: income.category,
    'Sub Category': income.subcategory || '-',
    'Category Type': income.categorytype,
    Amount: formatRM(income.amount),
    Source: income.source || '-',
    Remarks: income.remarks || '-',
    Notes: income.notes || '-',
  }))

  downloadCSV(formattedData, `income-report-${dateRange}`)
}

// Export dues report
export function exportDuesReport(dues: any[], dateRange: string) {
  const formattedData = dues.map(due => ({
    Date: typeof due.date === 'string' ? due.date : new Date(due.date).toISOString().split('T')[0],
    Description: due.description,
    Amount: formatRM(due.amount),
    Status: due.status,
    Category: due.category || '-',
    'Paid Date': due.paiddate ? (typeof due.paiddate === 'string' ? due.paiddate : new Date(due.paiddate).toISOString().split('T')[0]) : '-',
    Notes: due.notes || '-',
  }))

  downloadCSV(formattedData, `dues-report-${dateRange}`)
}

// Export Virmanis sales report
export function exportVirmanisSalesReport(
  sales: any[],
  dateRange: string
) {
  const formattedData = sales.map(sale => ({
    Date: typeof sale.date === 'string' ? sale.date : new Date(sale.date).toISOString().split('T')[0],
    'Customer Name': sale.customername,
    'Product Name': sale.productname,
    Quantity: sale.quantity,
    'Unit Price': formatRM(sale.unitprice),
    'Total Amount': formatRM(sale.totalamount),
    'Payment Method': sale.paymentmethod,
    Remarks: sale.remarks || '-',
    Notes: sale.notes || '-',
  }))

  downloadCSV(formattedData, `virmanis-sales-${dateRange}`)
}
